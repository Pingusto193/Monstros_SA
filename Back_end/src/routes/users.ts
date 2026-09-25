import { Router } from 'express';
import { z } from 'zod';
import { getViewer, requireViewer } from '../auth.ts';
import { prisma } from '../db.ts';
import { HttpError, notFound, validationError } from '../errors.ts';
import { resolveOwnImage } from '../images.ts';
import { absoluteUrl, page, sightingInclude, toCurrentUser, toSighting, toUser, toUserSummary } from '../serializers.ts';
import { normalizeForSearch } from '../text.ts';
import { pageQuerySchema, parse, parseId, RESERVED_USERNAMES, updateProfileSchema, usernameSchema } from '../validation.ts';

export const usersRouter = Router();

const limitQuery = z.object({ limit: z.coerce.number().int().min(1).max(20).optional() });

// Rotas fixas antes de /users/:username
usersRouter.get('/featured', async (req, res) => {
  const { limit = 5 } = parse(limitQuery, req.query);
  const viewer = getViewer(res);
  const users = await prisma.user.findMany({
    where: { oficial: false, posts: { some: {} }, ...(viewer ? { id: { not: viewer.id } } : {}) },
    include: { _count: { select: { posts: true } } },
    orderBy: [{ posts: { _count: 'desc' } }, { nome: 'asc' }],
    take: limit,
  });
  res.json(users.map((user) => ({ ...toUserSummary(req, user), sightingsCount: user._count.posts })));
});

usersRouter.get('/availability', async (req, res) => {
  const parsed = usernameSchema.safeParse(req.query.username ?? '');
  if (!parsed.success) return void res.json({ available: false });
  const username = parsed.data;
  const viewer = getViewer(res);
  const owner = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  const available =
    (owner === null && !RESERVED_USERNAMES.has(username)) || (owner !== null && owner.id === viewer?.id);
  res.json({ available });
});

usersRouter.get('/', async (req, res) => {
  const { search = '', limit = 8 } = parse(
    z.object({ search: z.string().max(60).optional(), limit: z.coerce.number().int().min(1).max(20).optional() }),
    req.query,
  );
  const term = search.trim().replace(/^@+/, '');
  if (term.length < 2) return void res.json([]);
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: normalizeForSearch(term), mode: 'insensitive' } },
        { nome: { contains: term, mode: 'insensitive' } },
      ],
    },
    orderBy: { username: 'asc' },
    take: limit,
  });
  res.json(users.map((user) => toUserSummary(req, user)));
});

usersRouter.patch('/me', async (req, res) => {
  const viewer = requireViewer(res);
  const input = parse(updateProfileSchema, req.body);

  if (input.username !== viewer.username) {
    const taken =
      RESERVED_USERNAMES.has(input.username) ||
      Boolean(await prisma.user.findUnique({ where: { username: input.username }, select: { id: true } }));
    if (taken) {
      throw new HttpError(409, 'USERNAME_TAKEN', 'Este nome de usuário já está em uso.', {
        username: 'Este nome de usuário já está em uso.',
      });
    }
  }

  // Foto: pode ser removida, mantida ou trocada por uma imagem enviada pelo próprio usuário.
  let fotoPerfil = viewer.fotoPerfil;
  if (input.avatarUrl === null) {
    fotoPerfil = null;
  } else if (input.avatarUrl !== absoluteUrl(req, viewer.fotoPerfil)) {
    const image = await resolveOwnImage(input.avatarUrl, viewer.id);
    if (!image) throw validationError('A imagem de perfil é inválida.');
    fotoPerfil = image.path;
  }

  const user = await prisma.user.update({
    where: { id: viewer.id },
    data: { nome: input.name, username: input.username, bio: input.bio, fotoPerfil },
  });
  res.json(toCurrentUser(req, user));
});

usersRouter.get('/:id/sightings', async (req, res) => {
  const userId = parseId(req.params.id, 'Perfil não encontrado.');
  const { cursor, limit = 12 } = parse(pageQuerySchema, req.query);
  const viewer = getViewer(res);
  const where = { autorId: userId };
  const [total, posts] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      include: sightingInclude(viewer?.id ?? null),
      orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
      skip: cursor,
      take: limit,
    }),
  ]);
  res.json(page(posts.map((post) => toSighting(req, post)), cursor, limit, total));
});

usersRouter.get('/:username', async (req, res) => {
  const username = String(req.params.username).trim().replace(/^@+/, '').toLowerCase();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw notFound('Perfil não encontrado.');

  const [count, likes, regions] = await prisma.$transaction([
    prisma.post.count({ where: { autorId: user.id } }),
    prisma.post.aggregate({ where: { autorId: user.id }, _sum: { quantidadeCurtidas: true } }),
    prisma.post.groupBy({
      by: ['estado'],
      where: { autorId: user.id },
      _count: { estado: true },
      orderBy: [{ _count: { estado: 'desc' } }, { estado: 'asc' }],
    }),
  ]);

  res.json({
    user: toUser(req, user),
    stats: { sightings: count, likesReceived: likes._sum.quantidadeCurtidas ?? 0, regions: regions.length },
    regions: regions.map((region) => region.estado),
  });
});
