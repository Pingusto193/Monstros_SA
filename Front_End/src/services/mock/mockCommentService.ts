import { getDatabase, transaction } from '@/mocks/db';
import type { CommentRecord } from '@/mocks/records';
import { createId } from '@/utils/id';
import { cleanText } from '@/utils/text';
import { validateComment } from '@/utils/validation';
import type { CommentService } from '../contracts';
import { AppError } from '../errors';
import { createCommentMapper, requireViewerId, simulateLatency } from './support';

export const mockCommentService: CommentService = {
  async list(sightingId) {
    await simulateLatency();
    const db = getDatabase();
    if (!db.sightings.some((sighting) => sighting.id === sightingId)) {
      throw new AppError('NOT_FOUND', 'Este avistamento não existe ou foi removido.');
    }
    const toComment = createCommentMapper(db);
    return db.comments
      .filter((comment) => comment.sightingId === sightingId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(toComment);
  },

  async create({ sightingId, text }) {
    const userId = requireViewerId();
    const error = validateComment(text);
    if (error) throw new AppError('VALIDATION', error, { text: error });

    const record = transaction(['comments'], (db) => {
      if (!db.sightings.some((sighting) => sighting.id === sightingId)) {
        throw new AppError('NOT_FOUND', 'Este avistamento não existe ou foi removido.');
      }
      const comment: CommentRecord = {
        id: createId('cmt'),
        sightingId,
        authorId: userId,
        text: cleanText(text),
        createdAt: new Date().toISOString(),
      };
      db.comments = [...db.comments, comment];
      return comment;
    });

    await simulateLatency('write');
    return createCommentMapper(getDatabase())(record);
  },

  async remove(commentId) {
    const userId = requireViewerId();
    transaction(['comments'], (db) => {
      const comment = db.comments.find((item) => item.id === commentId);
      if (!comment) throw new AppError('NOT_FOUND', 'Este comentário já foi removido.');
      const sighting = db.sightings.find((item) => item.id === comment.sightingId);
      // Pode excluir: o autor do comentário ou o autor do avistamento.
      if (comment.authorId !== userId && sighting?.authorId !== userId) {
        throw new AppError('FORBIDDEN', 'Você não pode excluir este comentário.');
      }
      db.comments = db.comments.filter((item) => item.id !== commentId);
    });
    await simulateLatency('write');
  },
};
