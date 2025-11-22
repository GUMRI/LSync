import { BaseItem } from './base-item';

export interface ISyncAdapter<T extends BaseItem> {
  fetchItems(checkpoint?: number): Promise<T[]>;
  saveItems(items: T[]): Promise<void>;
  updateCheckpoint(checkpoint: number): Promise<void>;
  getCheckpoint(): Promise<number | null>;
  deleteItem(id: string): Promise<void>;
}
