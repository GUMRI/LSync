import { BaseItem } from '../interfaces/base-item';
import { ISyncAdapter } from '../interfaces/sync-adapter';

export abstract class RemoteAdapter<T extends BaseItem> implements ISyncAdapter<T> {
  abstract fetchItems(checkpoint?: number): Promise<T[]>;
  abstract saveItems(items: T[]): Promise<void>;
  abstract updateCheckpoint(checkpoint: number): Promise<void>;
  abstract getCheckpoint(): Promise<number | null>;
  abstract deleteItem(id: string): Promise<void>;
}
