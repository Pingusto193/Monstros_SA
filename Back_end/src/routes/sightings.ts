import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '../../../generated/prisma/client.ts';
import { getViewer, requireViewer } from '../auth.ts';
import { prisma } from '../db.ts';
import { forbidden, notFound, validationError } from '../errors.ts';
import { imageIdFromPath, resolveOwnImage } from '../images.ts';
import { absoluteUrl, page, sightingInclude, toComment, toSighting } from '../serializers.ts';
import { normalizeForSearch } from '../text.ts';
import {
  commentSchema,
  createSightingSchema,
  pageQuerySchema,
  parse,
  parseId,
  searchQuerySchema,
} from '../validation.ts';

export const sightingsRouter = Router();
export const commentsRouter = Router();
export const regionsRouter = Router();

const NOT_FOUND = 'Este avistamento não existe ou foi removido.';
const PERIOD_DAYS = { '7d': 7, '30d': 30, '365d': 365 } as const;

const ORDER_BY: Record<string, Prisma.PostOrderByWithRelationInput[]> = {
  recent: [{ criadoEm: 'desc' }, { id: 'desc' }],
  popular: [{ quantidadeCurtidas: 'desc' }, { comentarios: { _count: 'desc' } }, { criadoEm: 'desc' }],
  discussed: [{ comentarios: { _count: 'desc' } }, { quantidadeCurtidas: 'desc' }, { criadoEm: 'desc' }],
  'sighting-date': [
    { dataAvistamento: 'desc' },
    { horaAvistamento: { sort: 'desc', nulls: 'last' } },
    { criadoEm: 'desc' },
  ],
};

async function listSightings(
  where: Prisma.PostWhereInput,
  orderBy: Prisma.PostOrderByWithRelationInput[],
  offset: number,
  limit: number,
  viewerId: number | null,
) {
  return prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({ where, orderBy, skip: offset, take: limit, include: sightingInclude(viewerId) }),
  ]);
}

sightingsRouter.get('/feed', async (req, res) => {
  const { cursor, limit = 6 } = parse(pageQuerySchema, req.query);
  const viewer = getViewer(res);
  const [total, posts] = await listSightings({}, ORDER_BY.recent!, cursor, limit, viewer?.id ?? null);
  res.json(page(posts.map((post) => toSighting(req, post)), cursor, limit, total));
});

sightingsRouter.get('/', async (req, res) => {
  const { query, region, period, sort, cursor, limit = 18 } = parse(searchQuerySchema, req.query);
  const viewer = getViewer(res);

  const conditions: Prisma.PostWhereInput[] = [];
  const terms = normalizeForSearch(query)
    .split(/\s+/)
    .map((term) => term.replace(/^@+/, ''))
    .filter(Boolean)
    .slice(0, 6);
  for (const term of terms) {
    conditions.push({
      OR: [
        { busca: { contains: term } },
        { autor: { username: { contains: term, mode: 'insensitive' } } },
        { autor: { nome: { contains: term, mode: 'insensitive' } } },
      ],
    });
  }
  if (region.trim()) conditions.push({ estado: { equals: region.trim(), mode: 'insensitive' } });
  if (period !== 'all') {
    const since = new Date(Date.now() - PERIOD_DAYS[period] * 86_400_000).toISOString().slice(0, 10);
    conditions.push({ dataAvistamento: { gte: new Date(`${since}T00:00:00.000Z`) } });
  }

  const [total, posts] = await listSightings(
    { AND: conditions },
    ORDER_BY[sort] ?? ORDER_BY.recent!,
    cursor,
    limit,
    viewer?.id ?? null,
  );
  res.json(page(posts.map((post) => toSighting(req, post)), cursor, limit, total));
});

sightingsRouter.get('/:id', async (req, res) => {
  const id = parseId(req.params.id, NOT_FOUND);
  const viewer = getViewer(res);
  const post = await prisma.post.findUnique({ where: { id }, include: sightingInclude(viewer?.id ?? null) });
  if (!post) throw notFound(NOT_FOUND);
  res.json(toSighting(req, post));
});

sightingsRouter.post('/', async (req, res) => {
  const viewer = requireViewer(res);
  const input = parse(createSightingSchema, req.body);

  const image = await resolveOwnImage(input.photo.url, viewer.id);
  if (!image) throw validationError('Envie a foto do avistamento novamente.', { photo: 'Envie a foto do avistamento novamente.' });

  const { place, city, region, country, coordinates } = input.location;
  const post = await prisma.post.create({
    data: {
      autorId: viewer.id,
      texto: input.description,
      imagem: image.path,
      imagemLargura: image.width,
      imagemAltura: image.height,
      local: place,
      cidade: city,
      estado: region,
      pais: country,
      latitude: coordinates ? Math.round(coordinates.latitude * 1e5) / 1e5 : null,
      longitude: coordinates ? Math.round(coordinates.longitude * 1e5) / 1e5 : null,
      precisaoMetros: coordinates?.accuracy != null ? Math.round(coordinates.accuracy) : null,
      dataAvistamento: new Date(`${input.sightingDate}T00:00:00.000Z`),
      horaAvistamento: input.sightingTime,
      busca: normalizeForSearch([place, city, region, country, input.description].join(' ')),
    },
    include: sightingInclude(viewer.id),
  });
  res.status(201).json(toSighting(req, post));
});

sightingsRouter.delete('/:id', async (_req, res) => {
  const viewer = requireViewer(res);
  const id = parseId(_req.params.id, NOT_FOUND);
  const post = await prisma.post.findUnique({ where: { id }, select: { autorId: true, imagem: true } });
  if (!post) throw notFound(NOT_FOUND);
  if (post.autorId !== viewer.id) throw forbidden('Você só pode excluir os seus próprios avistamentos.');

  const imageId = imageIdFromPath(post.imagem);
  await prisma.$transaction([
    prisma.post.delete({ where: { id } }), // comentários e curtidas saem em cascata
    ...(imageId ? [prisma.imagem.deleteMany({ where: { id: imageId, donoId: viewer.id } })] : []),
  ]);
  res.status(204).end();
});

async function setLike(postId: number, userId: number, liked: boolean) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({ where: { id: postId }, select: { quantidadeCurtidas: true } });
    if (!post) throw notFound(NOT_FOUND);
    const key = { usuarioId_postId: { usuarioId: userId, postId } };
    const existing = await tx.curtida.findUnique({ where: key });

    if (liked && !existing) {
      await tx.curtida.create({ data: { usuarioId: userId, postId } });
      const updated = await tx.post.update({ where: { id: postId }, data: { quantidadeCurtidas: { increment: 1 } } });
      return { likeCount: updated.quantidadeCurtidas, likedByMe: true };
    }
    if (!liked && existing) {
      await tx.curtida.delete({ where: key });
      const updated = await tx.post.update({
        where: { id: postId },
        data: { quantidadeCurtidas: { decrement: post.quantidadeCurtidas > 0 ? 1 : 0 } },
      });
      return { likeCount: updated.quantidadeCurtidas, likedByMe: false };
    }
    return { likeCount: post.quantidadeCurtidas, likedByMe: liked };
  });
}

sightingsRouter.put('/:id/like', async (req, res) => {
  const viewer = requireViewer(res);
  res.json(await setLike(parseId(req.params.id, NOT_FOUND), viewer.id, true));
});

sightingsRouter.delete('/:id/like', async (req, res) => {
  const viewer = requireViewer(res);
  res.json(await setLike(parseId(req.params.id, NOT_FOUND), viewer.id, false));
});

sightingsRouter.get('/:id/comments', async (req, res) => {
  const id = parseId(req.params.id, NOT_FOUND);
  if (!(await prisma.post.findUnique({ where: { id }, select: { id: true } }))) throw notFound(NOT_FOUND);
  const comments = await prisma.comentario.findMany({
    where: { postId: id },
    orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }],
    include: { autor: true },
  });
  res.json(comments.map((comment) => toComment(req, comment)));
});

sightingsRouter.post('/:id/comments', async (req, res) => {
  const viewer = requireViewer(res);
  const id = parseId(req.params.id, NOT_FOUND);
  const { text } = parse(commentSchema, req.body);
  if (!(await prisma.post.findUnique({ where: { id }, select: { id: true } }))) throw notFound(NOT_FOUND);
  const comment = await prisma.comentario.create({
    data: { texto: text, postId: id, autorId: viewer.id },
    include: { autor: true },
  });
  res.status(201).json(toComment(req, comment));
});

commentsRouter.delete('/:id', async (req, res) => {
  const viewer = requireViewer(res);
  const id = parseId(req.params.id, 'Este comentário já foi removido.');
  const comment = await prisma.comentario.findUnique({ where: { id }, include: { post: { select: { autorId: true } } } });
  if (!comment) throw notFound('Este comentário já foi removido.');
  // Pode excluir: quem escreveu o comentário ou o autor do avistamento.
  if (comment.autorId !== viewer.id && comment.post.autorId !== viewer.id) {
    throw forbidden('Você não pode excluir este comentário.');
  }
  await prisma.comentario.delete({ where: { id } });
  res.status(204).end();
});

regionsRouter.get('/', async (req, res) => {
  const { limit = 10 } = parse(z.object({ limit: z.coerce.number().int().min(1).max(30).optional() }), req.query);
  const groups = await prisma.post.groupBy({
    by: ['estado', 'pais'],
    _count: { _all: true },
    _max: { criadoEm: true },
  });
  const top = groups
    .sort(
      (a, b) =>
        b._count._all - a._count._all || (b._max.criadoEm?.getTime() ?? 0) - (a._max.criadoEm?.getTime() ?? 0),
    )
    .slice(0, limit);

  const covers = await Promise.all(
    top.map((group) =>
      prisma.post.findFirst({
        where: { estado: group.estado, pais: group.pais },
        orderBy: { criadoEm: 'desc' },
        select: { imagem: true },
      }),
    ),
  );

  res.json(
    top.map((group, index) => ({
      region: group.estado,
      country: group.pais,
      count: group._count._all,
      coverUrl: absoluteUrl(req, covers[index]?.imagem ?? null),
    })),
  );
});
