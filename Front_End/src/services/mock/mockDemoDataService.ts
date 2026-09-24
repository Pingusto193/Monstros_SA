import { resetDatabase } from '@/mocks/db';
import type { DemoDataService } from '../contracts';
import { tokenStorage } from '../tokenStorage';
import { simulateLatency } from './support';

export const mockDemoDataService: DemoDataService = {
  async reset() {
    await simulateLatency('write');
    tokenStorage.clear();
    resetDatabase();
  },
};
