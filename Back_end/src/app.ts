import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { MulterError } from 'multer';
import { Prisma } from '../../generated/prisma/client.ts';
import { authenticate } from './auth.ts';
import { config } from './config.ts';
import { prisma } from './db.ts';
import { HttpError } from './errors.ts';
import { authRouter } from './routes/auth.ts';
import { imagesRouter, uploadsRouter } from './routes/media.ts';
import { commentsRouter, regionsRouter, sightingsRouter } from './routes/sightings.ts';
import { usersRouter } from './routes/users.ts';

export function createApp() {
  const app = express();

  // No Render a API fica atrás de um proxy (HTTPS, IP real do cliente).
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // As imagens são carregadas pelo front, que está em outro domínio.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86_400,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(authenticate);

  app.get('/', (_req, res) => {
    res.json({ name: 'Rastro API', status: 'ok' });
  });

  // Avatar da conta oficial (arquivo da identidade visual, compartilhado com o front).
  app.use(
    '/brand',
    express.static(fileURLToPath(new URL('../../Front_End/public/brand', import.meta.url)), { maxAge: '7d' }),
  );

  app.get('/health', async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/sightings', sightingsRouter);
  app.use('/comments', commentsRouter);
  app.use('/regions', regionsRouter);
  app.use('/uploads', uploadsRouter);
  app.use('/images', imagesRouter);

  app.use((_req, res) => {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Rota não encontrada.' });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error.fieldErrors });
      return;
    }
    if (error instanceof MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE' ? 'A imagem é muito grande. O limite é de 5 MB.' : 'Não foi possível receber a imagem.';
      res.status(400).json({ code: 'INVALID_FILE', message });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ code: 'VALIDATION', message: 'Este registro já existe.' });
      return;
    }
    if (error?.type === 'entity.parse.failed' || error?.type === 'entity.too.large') {
      res.status(400).json({ code: 'VALIDATION', message: 'Requisição inválida.' });
      return;
    }
    console.error(error);
    res.status(500).json({ code: 'UNKNOWN', message: 'Algo deu errado no servidor. Tente novamente.' });
  };
  app.use(errorHandler);

  return app;
}
