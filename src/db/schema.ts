import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 1. USUÁRIOS (Controle de quem pode entrar na loja)
export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }), // SQLite gera sozinho!
  cpf: text().notNull().unique(),
  name: text().notNull(),
  isBlocked: integer({ mode: "boolean" }).default(false),
  createdAt: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// 2. LOGS DE ACESSO (Auditoria da trava da porta)
export const accessLogs = sqliteTable("access_logs", {
  id: integer().primaryKey({ autoIncrement: true }), // SQLite gera sozinho!
  cpf: text(), // null na saída anônima (ENTRY sempre tem CPF)
  type: text({ enum: ["ENTRY", "EXIT"] }).notNull(),
  status: text({ enum: ["GRANTED", "DENIED"] }).notNull(),
  createdAt: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// 3. PRODUTOS (Catálogo lido pelo leitor de código de barras)
export const products = sqliteTable("products", {
  id: integer().primaryKey({ autoIncrement: true }), // SQLite gera sozinho!
  barcode: text().notNull().unique(),
  name: text().notNull(),
  priceInCents: integer().notNull(),
});

// 4. VENDAS (Cabeçalho da transação do Totem)
export const sales = sqliteTable("sales", {
  id: integer().primaryKey({ autoIncrement: true }), // SQLite gera sozinho!
  userId: integer().references(() => users.id), // comprador (null = consumo anônimo)
  totalInCents: integer().notNull(),
  status: text({ enum: ["PENDING", "PAID", "EXPIRED"] }).notNull(),
  pixQrCode: text(),
  createdAt: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// 5. ITENS DA VENDA (Carrinho consolidado por produto)
export const saleItems = sqliteTable("sale_items", {
  id: integer().primaryKey({ autoIncrement: true }), // SQLite gera sozinho!
  saleId: integer()
    .notNull()
    .references(() => sales.id),
  productId: integer()
    .notNull()
    .references(() => products.id),
  priceInCents: integer().notNull(),
  quantity: integer().notNull(),
});

// 6. COMANDOS DE LIBERAÇÃO DA PORTA (fila consumida pelo ESP32 via polling)
export const doorCommands = sqliteTable("door_commands", {
  id: integer().primaryKey({ autoIncrement: true }), // SQLite gera sozinho!
  createdAt: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
