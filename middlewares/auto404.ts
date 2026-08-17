import { MiddlewareHandler } from "hono";

export const auto404: MiddlewareHandler = async (c, next) => {
    await next(); // Executa a rota normalmente

    // Se a rota devolveu 200 mas o resultado do banco foi null
    if (c.res.status === 200) {
        const body = await c.res.clone().text();
        if (body === "null" || body === "") {
            c.res = c.text("Not Found", 404);
        }
    }
};
