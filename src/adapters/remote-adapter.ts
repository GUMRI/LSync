import {
  BaseItem,
  DeleteEntry,
  ISyncAdapter,
  OperationsMap,
  Unsubscribe,
  WatchCallback,
} from '../interfaces';

export abstract class RemoteAdapter<
  T extends BaseItem,
  Transaction = unknown,
  Batch = unknown,
> implements ISyncAdapter<T, Transaction, Batch>
{
  public transaction?: (executor: (transaction: Transaction) => Promise<void>) => Promise<void>;
  public batchedWrite?: Batch;

  // Core data methods
  public abstract fetchList(listName: string, checkpoint?: number | null, transaction?: Transaction): Promise<T[]>;
  public abstract watchList(
    listName: string,
    callback: WatchCallback<T>,
    checkpoint?: number | null
  ): Unsubscribe;
  public abstract mutate(listName: string, operations: OperationsMap<T>, transaction?: Transaction): Promise<void>;

  // Meta factory methods
  public abstract setOfflineClient(clientId: string): Promise<void>;
  public abstract deleteOfflineClient(clientId: string): Promise<void>;
  public abstract getOfflineClients(): Promise<string[]>;

  public abstract upsertDeletedEntry(listName: string, entry: DeleteEntry): Promise<void>;
  public abstract deleteDeletedEntry(listName: string, id: string): Promise<void>;
  public abstract watchDeletedEntries(
    listName: string,
    callback: WatchCallback<DeleteEntry>
  ): Unsubscribe;
  public abstract fetchDeletedEntries(listName: string, transaction?: Transaction): Promise<DeleteEntry[]>;
}
