import { BaseItem } from './base-item';
import { DeleteEntry } from './delete-entry';
import { OperationsMap, Unsubscribe, WatchCallback } from './operations';

export interface ISyncAdapter<T extends BaseItem, Transaction = unknown, Batch = unknown> {
  // Optional properties for transactions and batched writes
  transaction?: (executor: (transaction: Transaction) => Promise<void>) => Promise<void>;
  batchedWrite?: Batch;

  // Core data methods
  fetchList(listName: string, checkpoint?: number | null, transaction?: Transaction): Promise<T[]>;
  watchList(
    listName: string,
    callback: WatchCallback<T>,
    checkpoint?: number | null
  ): Unsubscribe;
  mutate(listName: string, operations: OperationsMap<T>, transaction?: Transaction): Promise<void>;

  // Meta factory methods for managing client state and deletions
  setOfflineClient(clientId: string): Promise<void>;
  deleteOfflineClient(clientId: string): Promise<void>;
  getOfflineClients(): Promise<string[]>;

  upsertDeletedEntry(listName: string, entry: DeleteEntry): Promise<void>;
  deleteDeletedEntry(listName: string, id: string): Promise<void>;
  watchDeletedEntries(listName: string, callback: WatchCallback<DeleteEntry>): Unsubscribe;
  fetchDeletedEntries(listName: string, transaction?: Transaction): Promise<DeleteEntry[]>;
}
