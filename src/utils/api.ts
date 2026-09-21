import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";

export type Env = { Bindings: { DB: D1Database } };

export const db = (c: Context<Env>) => drizzle(c.env.DB);
export const paramId = (c: Context) => Number(c.req.param("id"));
export const or404 = (c: Context, item: unknown) =>
  item ? c.json(item) : c.json({ error: "Not Found" }, 404);
