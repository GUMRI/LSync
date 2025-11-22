import { BaseItem, Filter, ILocalSyncAdapter } from '../interfaces';

export abstract class LocalAdapter<T extends BaseItem> implements ILocalSyncAdapter<T> {
  // --- Data Methods ---
  public abstract findMany(listName: string, idsOrFilters: string[] | Filter<T>): Promise<T[]>;
  public abstract addMany(listName: string, items: T[]): Promise<void>;
  public abstract updateMany(
    listName: string,
    items: (Partial<T> & { id: string })[]
  ): Promise<void>;
  public abstract deleteMany(listName: string, ids: string[]): Promise<void>;

  // --- Meta Methods ---
  public abstract upsertCheckpoint(listName: string, checkpoint: number): Promise<void>;
  public abstract getCheckpoint(listName: string): Promise<number | null>;

  public abstract setClientId(id: string): Promise<void>;
  public abstract getClientId(): Promise<string | null>;

  // --- Optional Methods ---
  public clear?(listName: string): Promise<void>;
}
