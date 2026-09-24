import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";

export type Env = { Bindings: { DB: D1Database; DOOR_TOKEN: string } };

export const db = (c: Context<Env>) => drizzle(c.env.DB);

export const idParam = (c: Context) => {
  const value = Number(c.req.param("id"));
  return Number.isInteger(value) && value > 0 ? value : undefined;
};

export const or404 = <T>(c: Context, item: T | undefined | null) =>
  item ? c.json(item) : c.json({ error: "Not Found" }, 404);