import { Hono } from "hono";
import { errorHandler } from "./middlewares/errorHandler";
import { auto404 } from "./middlewares/auto404";
import { productRoutes } from "./modules/products/products.routes";

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.onError(errorHandler);
app.use("*", auto404); // Intercepta tudo e converte null em 404

app.route("/products", productRoutes);

export default app;
