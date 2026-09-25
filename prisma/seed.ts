/**
 * Popula o banco com os dados de exemplo — os mesmos do modo mock do front
 * (Front_End/src/mocks/seed), para as duas versões ficarem iguais.
 *
 *   npm run db:seed            → só roda se o banco estiver vazio
 *   npm run db:reset-demo      → apaga tudo e recria os exemplos
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../Back_end/src/db.ts';
import { normalizeForSearch } from '../Back_end/src/text.ts';
import { SEED_COMMENTS } from '../Front_End/src/mocks/seed/comments.ts';
import { SEED_SIGHTINGS } from '../Front_End/src/mocks/seed/sightings.ts';
import { DEMO_PASSWORD, SEED_USERS } from '../Front_End/src/mocks/seed/users.ts';

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MINUTE = 60_000;

const PHOTO_SIZES = { portrait: [1080, 1350], square: [1080, 1080], landscape: [1080, 720] } as const;

function unsplashPhoto(photoId: string, aspect: keyof typeof PHOTO_SIZES) {
  const [width, height] = PHOTO_SIZES[aspect];
  return {
    url: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`,
    width,
    height,
  };
}

async function main() {
  const force = process.argv.includes('--force');
  const existing = await prisma.user.count();
  if (existing > 0 && !force) {
    console.log(`O banco já tem ${existing} usuário(s). Nada foi alterado (use --force para recriar os exemplos).`);
    return;
  }
  if (force) {
    // A ordem respeita as chaves estrangeiras.
    await prisma.$transaction([
      prisma.curtida.deleteMany(),
      prisma.comentario.deleteMany(),
      prisma.post.deleteMany(),
      prisma.sessao.deleteMany(),
      prisma.imagem.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  }

  const now = Date.now();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userIds = new Map<string, number>();

  for (const seed of SEED_USERS) {
    const avatar = !seed.avatar
      ? null
      : 'unsplash' in seed.avatar
        ? `https://images.unsplash.com/photo-${seed.avatar.unsplash}?auto=format&fit=crop&crop=faces&w=256&h=256&q=80`
        : seed.avatar.path; // servido pela própria API em /brand
    const user = await prisma.user.create({
      data: {
        nome: seed.name,
        username: seed.username,
        email: seed.email,
        bio: seed.bio,
        fotoPerfil: avatar,
        oficial: seed.isOfficial ?? false,
        senhaHash: passwordHash,
        criadoEm: new Date(now - seed.joinedDaysAgo * DAY),
      },
    });
    userIds.set(seed.id, user.id);
  }

  const postIds = new Map<string, number>();
  const postedAt = new Map<string, number>();

  for (const seed of SEED_SIGHTINGS) {
    const photo = unsplashPhoto(seed.photo.unsplash, seed.photo.aspect);
    const createdAt = now - seed.posted.days * DAY - (seed.posted.hours ?? 0) * HOUR;
    const sightingDate = new Date(now - seed.sightingDaysAgo * DAY).toISOString().slice(0, 10);
    const post = await prisma.post.create({
      data: {
        autorId: userIds.get(seed.authorId)!,
        texto: seed.description,
        imagem: photo.url,
        imagemLargura: photo.width,
        imagemAltura: photo.height,
        local: seed.place,
        cidade: seed.city,
        estado: seed.region,
        pais: seed.country,
        latitude: seed.coordinates?.[0] ?? null,
        longitude: seed.coordinates?.[1] ?? null,
        precisaoMetros: seed.coordinates?.[2] ?? null,
        dataAvistamento: new Date(`${sightingDate}T00:00:00.000Z`),
        horaAvistamento: seed.sightingTime,
        busca: normalizeForSearch([seed.place, seed.city, seed.region, seed.country, seed.description].join(' ')),
        criadoEm: new Date(createdAt),
        quantidadeCurtidas: seed.likeCount,
      },
    });
    postIds.set(seed.id, post.id);
    postedAt.set(seed.id, createdAt);
  }

  await prisma.comentario.createMany({
    data: SEED_COMMENTS.map((seed, index) => ({
      texto: seed.text,
      postId: postIds.get(seed.sightingId)!,
      autorId: userIds.get(seed.authorId)!,
      criadoEm: new Date(
        Math.min((postedAt.get(seed.sightingId) ?? now) + seed.after * MINUTE, now - (SEED_COMMENTS.length - index) * MINUTE),
      ),
    })),
  });

  await prisma.curtida.createMany({
    data: SEED_SIGHTINGS.flatMap((seed) =>
      seed.likedBy.map((userId) => ({ usuarioId: userIds.get(userId)!, postId: postIds.get(seed.id)! })),
    ),
  });

  console.log(
    `Pronto: ${SEED_USERS.length} usuários, ${SEED_SIGHTINGS.length} avistamentos e ${SEED_COMMENTS.length} comentários.`,
  );
  console.log(`Todos os usuários de exemplo usam a senha "${DEMO_PASSWORD}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
