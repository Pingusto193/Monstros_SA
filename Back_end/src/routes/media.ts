import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireViewer } from '../auth.ts';
import { prisma } from '../db.ts';
import { HttpError, notFound } from '../errors.ts';
import { detectImageType, imagePath, MAX_UPLOAD_BYTES } from '../images.ts';
import { baseUrl } from '../serializers.ts';
import { parse } from '../validation.ts';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 5 },
});

const uploadFields = z.object({
  width: z.coerce.number().int().min(1).max(10_000),
  height: z.coerce.number().int().min(1).max(10_000),
  kind: z.enum(['sighting', 'avatar']).optional(),
});

export const uploadsRouter = Router();
export const imagesRouter = Router();

/** Recebe a foto (já comprimida pelo navegador) e guarda no banco. */
uploadsRouter.post('/', upload.single('file'), async (req, res) => {
  const viewer = requireViewer(res);
  if (!req.file) throw new HttpError(400, 'INVALID_FILE', 'Nenhuma imagem foi enviada.');

  const type = detectImageType(req.file.buffer);
  if (!type) throw new HttpError(400, 'INVALID_FILE', 'Formato não suportado. Envie uma imagem JPG, PNG ou WEBP.');
  const { width, height } = parse(uploadFields, req.body);

  const image = await prisma.imagem.create({
    data: { dados: new Uint8Array(req.file.buffer), tipo: type, largura: width, altura: height, donoId: viewer.id },
    select: { id: true },
  });
  res.status(201).json({ url: `${baseUrl(req)}${imagePath(image.id)}`, width, height });
});

/** Serve a imagem. O conteúdo nunca muda (cada envio gera um id novo), então pode ficar em cache. */
imagesRouter.get('/:id', async (req, res) => {
  const id = z.uuid().safeParse(req.params.id);
  if (!id.success) throw notFound('Imagem não encontrada.');
  const image = await prisma.imagem.findUnique({ where: { id: id.data }, select: { dados: true, tipo: true } });
  if (!image) throw notFound('Imagem não encontrada.');

  res.set({
    'Content-Type': image.tipo,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(Buffer.from(image.dados));
});
