import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { products } from "../../db/schema";
import { db, or404, type Env } from "../../utils/api";
import { crud } from "../../utils/crud";

export const productRoutes = new Hono<Env>();

crud(productRoutes, products);

productRoutes.get("/barcode/:barcode", async (c) =>
  or404(c, await db(c).select().from(products).where(eq(products.barcode, c.req.param("barcode"))).get())
);