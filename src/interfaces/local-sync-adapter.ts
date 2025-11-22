import { BaseItem } from './base-item';
import { ISyncAdapter } from './sync-adapter';
import { DeleteEntry } from './delete-entry';

export interface ILocalSyncAdapter<T extends BaseItem> extends ISyncAdapter<T> {
  createDeleteEntry(entry: DeleteEntry): Promise<void>;
  fetchDeleteEntries(): Promise<DeleteEntry[]>;
  updateDeleteEntry(entry: DeleteEntry): Promise<void>;
  removeDeleteEntry(id: string): Promise<void>;
}
