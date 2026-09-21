import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { products } from "../../db/schema";
import { db, paramId, or404, type Env } from "../../utils/api";

export const productRoutes = new Hono<Env>();
const schema = createInsertSchema(products).omit({ id: true });

productRoutes.get("/", async (c) => c.json(await db(c).select().from(products)));
productRoutes.get("/:id", async (c) => or404(c, await db(c).select().from(products).where(eq(products.id, paramId(c))).get()));
productRoutes.get("/barcode/:barcode", async (c) => or404(c, await db(c).select().from(products).where(eq(products.barcode, c.req.param("barcode"))).get()));
productRoutes.post("/", zValidator("json", schema), async (c) => c.json(await db(c).insert(products).values(c.req.valid("json")).returning().get(), 201));
productRoutes.put("/:id", zValidator("json", schema.partial()), async (c) => or404(c, await db(c).update(products).set(c.req.valid("json")).where(eq(products.id, paramId(c))).returning().get()));
productRoutes.delete("/:id", async (c) => or404(c, await db(c).delete(products).where(eq(products.id, paramId(c))).returning().get()));
