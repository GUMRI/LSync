import { vi } from 'vitest';
import { BaseItem, Filter, ILocalSyncAdapter } from '../interfaces';

export class MockLocalAdapter<T extends BaseItem> implements ILocalSyncAdapter<T> {
  private data: Map<string, T> = new Map();
  private checkpoints: Map<string, number> = new Map();
  private clientId: string | null = null;

  findMany = vi.fn(async (listName: string, idsOrFilters: string[] | Filter<T>): Promise<T[]> => {
    if (Array.isArray(idsOrFilters)) {
      return idsOrFilters.map(id => this.data.get(id)).filter(Boolean) as T[];
    }
    // Simple filter implementation for testing
    return Array.from(this.data.values()).filter(item => {
      for (const key in idsOrFilters) {
        if (item[key as keyof T] !== idsOrFilters[key as keyof T]) {
          return false;
        }
      }
      return true;
    });
  });

  addMany = vi.fn(async (listName: string, items: T[]): Promise<void> => {
    items.forEach(item => this.data.set(item.id, item));
  });

  updateMany = vi.fn(async (listName: string, items: (Partial<T> & { id: string })[]): Promise<void> => {
    items.forEach(update => {
      const existing = this.data.get(update.id);
      if (existing) {
        this.data.set(update.id, { ...existing, ...update });
      }
    });
  });

  deleteMany = vi.fn(async (listName: string, ids: string[]): Promise<void> => {
    ids.forEach(id => this.data.delete(id));
  });

  upsertCheckpoint = vi.fn(async (listName: string, checkpoint: number): Promise<void> => {
    this.checkpoints.set(listName, checkpoint);
  });

  getCheckpoint = vi.fn(async (listName: string): Promise<number | null> => {
    return this.checkpoints.get(listName) || null;
  });

  setClientId = vi.fn(async (id: string): Promise<void> => {
    this.clientId = id;
  });

  getClientId = vi.fn(async (): Promise<string | null> => {
    return this.clientId;
  });

  // Helper for tests
  _getData() { return this.data; }
  _clear() { this.data.clear(); this.checkpoints.clear(); this.clientId = null; }
}
