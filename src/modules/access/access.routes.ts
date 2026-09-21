import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users, accessLogs } from "../../db/schema";
import { isValidCPF } from "../../utils/cpf";
import { db, type Env } from "../../utils/api";

export const accessRoutes = new Hono<Env>();

const cpfSchema = z.string().refine(isValidCPF, "CPF inválido");
const clean = (cpf: string) => cpf.replace(/\D/g, "");

// 1. Checa CPF na entrada
accessRoutes.post("/check", zValidator("json", z.object({ cpf: cpfSchema })), async (c) => {
  const cpf = clean(c.req.valid("json").cpf);
  const user = await db(c).select().from(users).where(eq(users.cpf, cpf)).get();

  if (!user) return c.json({ registered: false, allowed: false });

  await db(c).insert(accessLogs).values({ cpf, status: user.isBlocked ? "DENIED" : "GRANTED" });

  return user.isBlocked
    ? c.json({ registered: true, allowed: false, error: "Acesso bloqueado" }, 403)
    : c.json({ registered: true, allowed: true, name: user.name });
});

// 2. Cadastro rápido + liberação da porta
accessRoutes.post("/register", zValidator("json", z.object({ cpf: cpfSchema, name: z.string().min(2) })), async (c) => {
  const { name, cpf: rawCpf } = c.req.valid("json");
  const cpf = clean(rawCpf);

  const user = await db(c).insert(users).values({ cpf, name }).returning().get();
  await db(c).insert(accessLogs).values({ cpf, status: "GRANTED" });

  return c.json({ registered: true, allowed: true, name: user.name }, 201);
});
