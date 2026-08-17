import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { products } from "../../db/schema";

export const productRoutes = new Hono<{ Bindings: { DB: D1Database } }>();

const schema = createInsertSchema(products).omit({ id: true });

// GET All
productRoutes.get("/", async (c) =>
    c.json(await drizzle(c.env.DB).select().from(products))
);

// GET One (Se o banco retornar null, o middleware auto404 converte para 404!)
productRoutes.get("/:id", async (c) =>
    c.json(
        await drizzle(c.env.DB)
            .select()
            .from(products)
            .where(eq(products.barcode, c.req.param("id")))
            .get()
    )
);

productRoutes.get("/barcode/:barcode", async (c) =>
    c.json(
        await drizzle(c.env.DB)
            .select()
            .from(products)
            .where(eq(products.barcode, c.req.param("barcode")))
            .get()
    )
);

// POST Create
productRoutes.post("/", zValidator("json", schema), async (c) => {
    const item = await drizzle(c.env.DB)
        .insert(products)
        .values(c.req.valid("json"))
        .returning()
        .get();

    return c.json(item, 201);
});

// PUT Update
productRoutes.put("/:id", zValidator("json", schema.partial()), async (c) =>
    c.json(
        await drizzle(c.env.DB)
            .update(products)
            .set(c.req.valid("json"))
            .where(eq(products.id, c.req.param("id")))
            .returning()
            .get()
    )
);

// DELETE
productRoutes.delete("/:id", async (c) =>
    c.json(
        await drizzle(c.env.DB)
            .delete(products)
            .where(eq(products.id, c.req.param("id")))
            .returning()
            .get()
    )
);
