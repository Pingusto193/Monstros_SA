import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createSession, getSession, requireViewer } from '../auth.ts';
import { prisma } from '../db.ts';
import { HttpError, validationError } from '../errors.ts';
import { toCurrentUser } from '../serializers.ts';
import { changePasswordSchema, loginSchema, parse, registerSchema, RESERVED_USERNAMES } from '../validation.ts';

const BCRYPT_ROUNDS = 10;
// Hash fixo usado quando o e-mail não existe, para o tempo de resposta não revelar isso.
const DUMMY_HASH = bcrypt.hashSync('senha-que-nao-existe', BCRYPT_ROUNDS);

const attemptsLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      code: 'RATE_LIMITED',
      message: 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.',
    });
  },
});

export const authRouter = Router();

authRouter.post('/register', attemptsLimiter, async (req, res) => {
  const input = parse(registerSchema, req.body);

  if (await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } })) {
    throw new HttpError(409, 'EMAIL_TAKEN', 'Este e-mail já está cadastrado.', { email: 'Este e-mail já está cadastrado.' });
  }
  const usernameTaken =
    RESERVED_USERNAMES.has(input.username) ||
    Boolean(await prisma.user.findUnique({ where: { username: input.username }, select: { id: true } }));
  if (usernameTaken) {
    throw new HttpError(409, 'USERNAME_TAKEN', 'Este nome de usuário já está em uso.', {
      username: 'Este nome de usuário já está em uso.',
    });
  }

  const user = await prisma.user.create({
    data: {
      nome: input.name,
      username: input.username,
      email: input.email,
      senhaHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    },
  });
  const session = await createSession(user.id);
  res.status(201).json({ user: toCurrentUser(req, user), ...session });
});

authRouter.post('/login', attemptsLimiter, async (req, res) => {
  const input = parse(loginSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = await bcrypt.compare(input.password, user?.senhaHash ?? DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');

  // Aproveita para limpar sessões vencidas deste usuário.
  await prisma.sessao.deleteMany({ where: { usuarioId: user.id, expiraEm: { lt: new Date() } } });
  const session = await createSession(user.id);
  res.json({ user: toCurrentUser(req, user), ...session });
});

authRouter.post('/logout', async (_req, res) => {
  const sessionId = res.locals.sessionId as number | undefined;
  if (sessionId) await prisma.sessao.deleteMany({ where: { id: sessionId } });
  res.status(204).end();
});

authRouter.get('/me', async (req, res) => {
  const user = requireViewer(res);
  const session = getSession(res);
  res.json({ user: toCurrentUser(req, user), token: session.token, expiresAt: session.expiresAt });
});

authRouter.put('/password', attemptsLimiter, async (_req, res) => {
  const user = requireViewer(res);
  const session = getSession(res);
  const input = parse(changePasswordSchema, _req.body);

  if (!(await bcrypt.compare(input.currentPassword, user.senhaHash))) {
    throw validationError('A senha atual está incorreta.', { currentPassword: 'A senha atual está incorreta.' });
  }
  if (input.currentPassword === input.newPassword) {
    throw validationError('A nova senha deve ser diferente da atual.', {
      newPassword: 'A nova senha deve ser diferente da atual.',
    });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { senhaHash: await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS) } }),
    // Encerra as outras sessões, mantendo a atual.
    prisma.sessao.deleteMany({ where: { usuarioId: user.id, id: { not: session.id } } }),
  ]);
  res.status(204).end();
});
