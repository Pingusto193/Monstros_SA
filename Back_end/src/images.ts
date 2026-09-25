import { prisma } from './db.ts';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Confere a assinatura real do arquivo (não confia só no tipo informado pelo navegador). */
export function detectImageType(buffer: Buffer): (typeof IMAGE_TYPES)[number] | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

export const imagePath = (id: string) => `/images/${id}`;

const IMAGE_ID = /\/images\/([0-9a-f-]{36})$/i;

/**
 * Aceita uma URL de imagem só se ela apontar para uma imagem enviada pelo próprio usuário.
 * Devolve o caminho relativo que fica salvo no banco.
 */
export async function resolveOwnImage(url: string, ownerId: number) {
  const id = IMAGE_ID.exec(url)?.[1];
  if (!id) return null;
  const image = await prisma.imagem.findFirst({
    where: { id, donoId: ownerId },
    select: { id: true, largura: true, altura: true },
  });
  return image ? { path: imagePath(image.id), width: image.largura, height: image.altura } : null;
}

export function imageIdFromPath(path: string | null): string | null {
  return path ? (IMAGE_ID.exec(path)?.[1] ?? null) : null;
}
