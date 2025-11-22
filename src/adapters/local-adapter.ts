import { BaseItem } from '../interfaces/base-item';
import { DeleteEntry } from '../interfaces/delete-entry';
import { ILocalSyncAdapter } from '../interfaces/local-sync-adapter';

export abstract class LocalAdapter<T extends BaseItem> implements ILocalSyncAdapter<T> {
  abstract fetchItems(checkpoint?: number): Promise<T[]>;
  abstract saveItems(items: T[]): Promise<void>;
  abstract updateCheckpoint(checkpoint: number): Promise<void>;
  abstract getCheckpoint(): Promise<number | null>;
  abstract deleteItem(id: string): Promise<void>;

  abstract createDeleteEntry(entry: DeleteEntry): Promise<void>;
  abstract fetchDeleteEntries(): Promise<DeleteEntry[]>;
  abstract updateDeleteEntry(entry: DeleteEntry): Promise<void>;
  abstract removeDeleteEntry(id: string): Promise<void>;
}
