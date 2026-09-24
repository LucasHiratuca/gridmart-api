import type { ErrorHandler } from "hono";

const hasUniqueError = (err: any): boolean =>
  !!err && (err.message?.includes("UNIQUE constraint failed") || hasUniqueError(err.cause));

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[${c.req.method}] ${c.req.path}:`, err);
  const status = hasUniqueError(err) ? 409 : 500;
  const message = status === 409 ? "Conflito: registro já existe" : "Erro interno";
  return c.json({ error: message }, status);
};