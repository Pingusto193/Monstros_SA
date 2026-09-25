// Configuração do Prisma CLI (migrações e seed).
// DIRECT_URL (opcional) permite usar uma conexão direta nas migrações;
// se não existir, usa a mesma DATABASE_URL da aplicação.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
