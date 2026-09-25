import { Hono } from "hono";
import { errorHandler } from "./middlewares/errorHandler";
import { productRoutes } from "./modules/products/products.routes";
import { accessRoutes } from "./modules/access/access.routes";
import { saleRoutes } from "./modules/sales/sales.routes";
import type { Env } from "./utils/api";

const app = new Hono<Env>();

app.onError(errorHandler);
app.route("/products", productRoutes);
app.route("/access", accessRoutes);
app.route("/sales", saleRoutes);

export default app;
