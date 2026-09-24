import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { users, accessLogs, doorCommands } from "../../db/schema";
import { isValidCPF } from "../../utils/cpf";
import { db, type Env } from "../../utils/api";

export const accessRoutes = new Hono<Env>();

const cpfSchema = z.string().refine(isValidCPF, "CPF inválido");
const clean = (cpf: string) => cpf.replace(/\D/g, "");

const logAccess = (c: Parameters<typeof db>[0], cpf: string | null, type: "ENTRY" | "EXIT", status: "GRANTED" | "DENIED") =>
  db(c).insert(accessLogs).values({ cpf, type, status });

// Enfileira a liberação da porta para o ESP32 consumir via polling
const openDoor = (c: Parameters<typeof db>[0]) => db(c).insert(doorCommands).values({});

// 1. Checa CPF na entrada
accessRoutes.post("/check", zValidator("json", z.object({ cpf: cpfSchema })), async (c) => {
  const cpf = clean(c.req.valid("json").cpf);
  const user = await db(c).select().from(users).where(eq(users.cpf, cpf)).get();

  if (!user) return c.json({ registered: false, allowed: false });

  await logAccess(c, cpf, "ENTRY", user.isBlocked ? "DENIED" : "GRANTED");

  if (user.isBlocked) return c.json({ registered: true, allowed: false, error: "Acesso bloqueado" }, 403);

  await openDoor(c);
  return c.json({ registered: true, allowed: true, name: user.name });
});

// 2. Cadastro rápido + liberação da porta
accessRoutes.post("/register", zValidator("json", z.object({ cpf: cpfSchema, name: z.string().min(2) })), async (c) => {
  const { name, cpf: rawCpf } = c.req.valid("json");
  const cpf = clean(rawCpf);

  const user = await db(c).insert(users).values({ cpf, name }).returning().get();
  await logAccess(c, cpf, "ENTRY", "GRANTED");
  await openDoor(c);

  return c.json({ registered: true, allowed: true, name: user.name }, 201);
});

// 3. Saída: libera a porta (cpf opcional para rastrear quem saiu)
accessRoutes.post("/exit", zValidator("json", z.object({ cpf: cpfSchema.optional() })), async (c) => {
  const { cpf: rawCpf } = c.req.valid("json");
  await logAccess(c, rawCpf ? clean(rawCpf) : null, "EXIT", "GRANTED");
  await openDoor(c);

  return c.json({ allowed: true });
});

// 4. Fila de liberação consumida pelo ESP32 (polling)
accessRoutes.get("/door", async (c) => {
  if (c.req.header("x-door-token") !== c.env.DOOR_TOKEN) return c.json({ error: "Não autorizado" }, 401);

  const cmd = await db(c).select().from(doorCommands).orderBy(asc(doorCommands.id)).limit(1).get();
  if (!cmd) return c.json(null);

  await db(c).delete(doorCommands).where(eq(doorCommands.id, cmd.id));
  return c.json(cmd);
});