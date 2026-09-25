import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { config } from './config.ts';

function sslOptions() {
  if (config.databaseCa) return { ca: config.databaseCa };
  // O Supabase exige TLS e usa uma CA própria, fora da lista padrão do Node.
  // Para verificar a cadeia completa, informe o certificado em DATABASE_CA.
  if (/supabase\.(co|com)/.test(config.databaseUrl)) return { rejectUnauthorized: false };
  return undefined;
}

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
  ssl: sslOptions(),
  max: config.databasePoolMax,
});

export const prisma = new PrismaClient({ adapter });
