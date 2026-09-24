import { resizeImageFile, validateImageFile } from '@/utils/image';
import type { MediaService } from '../contracts';
import { AppError } from '../errors';
import { simulateLatency } from './support';

/**
 * "Upload" mockado: a imagem é redimensionada/comprimida no navegador e devolvida como data URL,
 * que fica salva junto com a publicação no localStorage. Com backend, este serviço envia o arquivo
 * para um storage de verdade e devolve a URL pública.
 */
export const mockMediaService: MediaService = {
  async uploadImage(file, { kind }) {
    const error = validateImageFile(file);
    if (error) throw new AppError('INVALID_FILE', error);

    try {
      const processed =
        kind === 'avatar'
          ? await resizeImageFile(file, { maxSize: 320, quality: 0.85, square: true })
          : await resizeImageFile(file, { maxSize: 1080, quality: 0.8 });
      await simulateLatency('write');
      return { url: processed.dataUrl, width: processed.width, height: processed.height };
    } catch (cause) {
      if (cause instanceof AppError) throw cause;
      throw new AppError('INVALID_FILE', 'Não foi possível processar esta imagem. Tente outro arquivo.');
    }
  },
};
