import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { config } from './config.ts';

function sslOptions() {
  if (config.databaseCa) return { ca: config.databaseCa };
  // Endereços externos do Render (e do Supabase) exigem TLS. Pela rede interna do Render
  // (URL sem domínio público) a conexão é local e dispensa TLS.
  // Para verificar a cadeia completa do certificado, informe-o em DATABASE_CA.
  if (/render\.com|supabase\.(co|com)/.test(config.databaseUrl)) return { rejectUnauthorized: false };
  return undefined;
}

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
  ssl: sslOptions(),
  max: config.databasePoolMax,
});

export const prisma = new PrismaClient({ adapter });
