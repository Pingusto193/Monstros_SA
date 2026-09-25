import { createApp } from './app.ts';
import { config } from './config.ts';
import { prisma } from './db.ts';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Rastro API rodando na porta ${config.port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${config.port} já está em uso. Feche a outra instância da API ou defina PORT no .env.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

async function shutdown(signal: string) {
  console.log(`${signal} recebido, encerrando…`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
