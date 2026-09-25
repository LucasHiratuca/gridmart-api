import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import type { Hono } from "hono";
import { db, idParam, or404, type Env } from "./api";

export function crud(app: Hono<Env>, table: SQLiteTableWithColumns<any>) {
  const insertSchema = createInsertSchema(table).omit({ id: true });

  app.get("/", async (c) => c.json(await db(c).select().from(table)));

  app.get("/:id", async (c) => {
    const id = idParam(c);
    if (!id) return c.json({ error: "Not Found" }, 404);
    return or404(c, await db(c).select().from(table).where(eq(table.id, id)).get());
  });

  app.post("/", zValidator("json", insertSchema), async (c) =>
    c.json(await db(c).insert(table).values(c.req.valid("json")).returning().get(), 201)
  );

  app.put("/:id", zValidator("json", insertSchema.partial()), async (c) => {
    const id = idParam(c);
    if (!id) return c.json({ error: "Not Found" }, 404);
    return or404(
      c,
      await db(c).update(table).set(c.req.valid("json")).where(eq(table.id, id)).returning().get()
    );
  });

  app.delete("/:id", async (c) => {
    const id = idParam(c);
    if (!id) return c.json({ error: "Not Found" }, 404);
    return or404(c, await db(c).delete(table).where(eq(table.id, id)).returning().get());
  });
}