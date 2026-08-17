import { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
    console.error(`[Error] ${c.req.method} ${c.req.path}:`, err);
    return c.text(err.message || "Internal Error", 500);
};
