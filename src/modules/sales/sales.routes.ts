import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { sales, saleItems, products, users } from "../../db/schema";
import { db, idParam, or404, type Env } from "../../utils/api";

export const saleRoutes = new Hono<Env>();

const schema = z.object({
  userId: z.number().int().positive().optional(), // comprador (se informado, deve existir)
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
  })).min(1),
});

// Pix estático (MVP: emissão local, sem integração com PSP)
const buildPix = (totalInCents: number) =>
  `00020126580014br.gov.bcb.pix0136gridmart-${Date.now()}520400005303986540${(totalInCents / 100).toFixed(2)}5802BR5908GRIDMART6009SAOPAULO62070503***6304`;

// 1. Criar Venda e Pix
saleRoutes.post("/", zValidator("json", schema), async (c) => {
  const d = db(c);
  const { userId, items } = c.req.valid("json");

  if (userId) {
    const buyer = await d.select({ id: users.id }).from(users).where(eq(users.id, userId)).get();
    if (!buyer) return c.json({ error: "Comprador não encontrado" }, 404);
  }

  let totalInCents = 0;
  const verified = [];

  for (const item of items) {
    const prod = await d.select().from(products).where(eq(products.id, item.productId)).get();
    if (!prod) return c.json({ error: `Produto ${item.productId} não encontrado` }, 404);
    totalInCents += prod.priceInCents * item.quantity;
    verified.push({ ...item, priceInCents: prod.priceInCents });
  }

  const sale = await d.insert(sales).values({
    userId,
    totalInCents,
    status: "PENDING",
    pixQrCode: buildPix(totalInCents),
  }).returning().get();

  for (const v of verified) {
    await d.insert(saleItems).values({ saleId: sale.id, ...v });
  }

  return c.json({ ...sale, items: verified }, 201);
});

// 2. Status da venda
saleRoutes.get("/:id", async (c) => {
  const id = idParam(c);
  if (!id) return c.json({ error: "Not Found" }, 404);
  return or404(c, await db(c).select().from(sales).where(eq(sales.id, id)).get());
});

// 3. Confirmar Pagamento
saleRoutes.post("/:id/pay", async (c) => {
  const id = idParam(c);
  if (!id) return c.json({ error: "Not Found" }, 404);
  return or404(c, await db(c).update(sales).set({ status: "PAID" }).where(eq(sales.id, id)).returning().get());
});