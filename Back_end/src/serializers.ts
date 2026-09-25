/**
 * Converte linhas do banco nos formatos que o front-end usa
 * (Front_End/src/types). IDs numéricos viram strings.
 */
import type { Request } from 'express';
import type { Comentario, Post, Prisma, User } from '../../generated/prisma/client.ts';
import { config } from './config.ts';

export function baseUrl(req: Request): string {
  return config.publicUrl ?? `${req.protocol}://${req.get('host')}`;
}

/** Imagens enviadas ficam salvas como "/images/<id>"; fotos externas (exemplos) já são URLs completas. */
export function absoluteUrl(req: Request, url: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${baseUrl(req)}${url}`;
}

export function toUserSummary(req: Request, user: User) {
  return {
    id: String(user.id),
    name: user.nome,
    username: user.username,
    avatarUrl: absoluteUrl(req, user.fotoPerfil),
    ...(user.oficial ? { isOfficial: true } : {}),
  };
}

export function toUser(req: Request, user: User) {
  return { ...toUserSummary(req, user), bio: user.bio, createdAt: user.criadoEm.toISOString() };
}

export function toCurrentUser(req: Request, user: User) {
  return { ...toUser(req, user), email: user.email };
}

export function toComment(req: Request, comment: Comentario & { autor: User }) {
  return {
    id: String(comment.id),
    sightingId: String(comment.postId),
    author: toUserSummary(req, comment.autor),
    text: comment.texto,
    createdAt: comment.criadoEm.toISOString(),
  };
}

/** O que buscar junto com cada avistamento para montar o card completo. */
export function sightingInclude(viewerId: number | null) {
  return {
    autor: true,
    _count: { select: { comentarios: true } },
    comentarios: { orderBy: { criadoEm: 'desc' }, take: 2, include: { autor: true } },
    curtidas: { where: { usuarioId: viewerId ?? -1 }, select: { usuarioId: true } },
  } satisfies Prisma.PostInclude;
}

type SightingRow = Post & {
  autor: User;
  _count: { comentarios: number };
  comentarios: Array<Comentario & { autor: User }>;
  curtidas: Array<{ usuarioId: number }>;
};

export function toSighting(req: Request, post: SightingRow) {
  const hasCoordinates = post.latitude !== null && post.longitude !== null;
  return {
    id: String(post.id),
    author: toUserSummary(req, post.autor),
    photo: {
      url: absoluteUrl(req, post.imagem) ?? '',
      width: post.imagemLargura,
      height: post.imagemAltura,
    },
    description: post.texto,
    location: {
      place: post.local,
      city: post.cidade,
      region: post.estado,
      country: post.pais,
      coordinates: hasCoordinates
        ? { latitude: post.latitude as number, longitude: post.longitude as number, accuracy: post.precisaoMetros }
        : null,
    },
    sightingDate: post.dataAvistamento.toISOString().slice(0, 10),
    sightingTime: post.horaAvistamento,
    createdAt: post.criadoEm.toISOString(),
    likeCount: post.quantidadeCurtidas,
    commentCount: post._count.comentarios,
    likedByMe: post.curtidas.length > 0,
    recentComments: [...post.comentarios].reverse().map((comment) => toComment(req, comment)),
  };
}

export function page<T>(items: T[], offset: number, limit: number, total: number) {
  const next = offset + limit;
  return { items, nextCursor: next < total ? String(next) : null, total };
}
