import { BaseItem } from './base-item';

/**
 * A flexible filter type for findMany.
 * Allows filtering by a subset of item properties.
 */
export type Filter<T> = { [P in keyof T]?: T[P] };

export interface ILocalSyncAdapter<T extends BaseItem> {
  // --- Data Methods ---
  findMany(listName: string, idsOrFilters: string[] | Filter<T>): Promise<T[]>;
  addMany(listName: string, items: T[]): Promise<void>;
  updateMany(listName: string, items: (Partial<T> & { id: string })[]): Promise<void>;
  deleteMany(listName: string, ids: string[]): Promise<void>;

  // --- Meta Methods ---
  upsertCheckpoint(listName: string, checkpoint: number): Promise<void>;
  getCheckpoint(listName: string): Promise<number | null>;

  setClientId(id: string): Promise<void>;
  getClientId(): Promise<string | null>;

  // --- Optional Methods ---
  clear?(listName: string): Promise<void>;
}
