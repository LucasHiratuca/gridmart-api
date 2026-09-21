# GridMart API 🛒⚡

API edge-first para lojas autônomas e micro-mercados inteligentes (totem de autoatendimento, controle de acesso e checkout Pix).

## 🛠️ Stack Tecnológica

- **Runtime**: [Bun](https://bun.com)
- **Framework**: [Hono](https://hono.dev)
- **Deploy & Infra**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Banco de Dados**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite na borda)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validação**: [Zod](https://zod.dev) & [drizzle-zod](https://orm.drizzle.team/docs/zod)

## 🚀 Como Rodar Localmente

1. **Instalar dependências**:
   ```bash
   bun install
   ```

2. **Iniciar servidor de desenvolvimento** (com Cloudflare D1 local via Wrangler):
   ```bash
   bun run dev
   ```

3. **Executar testes**:
   ```bash
   bun test
   ```

4. **Verificar tipagem**:
   ```bash
   bun run typecheck
   ```

5. **Migrações de Banco de Dados**:
   ```bash
   bun run db:generate # Gera novos arquivos SQL com base no schema.ts
   bun run db:migrate  # Aplica as migrações
   ```

## 📦 Módulos da API

- **Produtos** (`/products`): Cadastro e consulta por ID ou código de barras para o leitor do totem.
- **Portaria / Acesso** *(em desenvolvimento)*: Validação de CPF e liberação de trava eletrônica.
- **Totem / Vendas** *(em desenvolvimento)*: Carrinho de compras e cobrança via Pix.

