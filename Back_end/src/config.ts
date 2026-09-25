import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente obrigatória ausente: ${name} (veja o .env.example).`);
  return value;
}

function list(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT ?? 3333),
  databaseUrl: required('DATABASE_URL'),
  /** Conexões simultâneas com o banco (o banco local do `prisma dev` só aceita 1). */
  databasePoolMax: Number(process.env.DATABASE_POOL_MAX ?? 5),
  /** Certificado CA do banco (opcional). Sem ele, conexões ao Supabase usam TLS sem verificar a cadeia. */
  databaseCa: process.env.DATABASE_CA?.replace(/\\n/g, '\n'),
  /** Origens do front-end autorizadas pelo CORS, separadas por vírgula. */
  corsOrigins: list(process.env.CORS_ORIGIN, ['http://localhost:5173']),
  /** URL pública da API (ex.: https://rastro-api.onrender.com). Se ausente, é deduzida da requisição. */
  publicUrl: process.env.PUBLIC_API_URL?.replace(/\/$/, ''),
  isProduction: process.env.NODE_ENV === 'production',
};
