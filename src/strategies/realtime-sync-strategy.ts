import {
  BaseItem,
  DeleteEntry,
  ILocalSyncAdapter,
  ISyncAdapter,
  ISyncStrategy,
  ISyncStrategySetupParams,
  OperationsMap,
  Unsubscribe,
} from '../interfaces';
import {
  CheckpointProvider,
  LwwConflictHandler,
  PendingQueue,
  RemoveWinsHandler,
} from '../core';

export class RealtimeSyncStrategy<T extends BaseItem> implements ISyncStrategy<T> {
  private localAdapter!: ILocalSyncAdapter<T>;
  private remoteAdapter!: ISyncAdapter<T>;
  private conflictHandler!: LwwConflictHandler<T>;
  private pendingQueue!: PendingQueue<T>;
  private removeWinsHandler!: RemoveWinsHandler<T>;
  private checkpointProvider!: CheckpointProvider;

  private unsubscribes: Map<string, Unsubscribe[]> = new Map();
  private deletedEntries: Map<string, DeleteEntry[]> = new Map();

  public async setup(params: ISyncStrategySetupParams<T>): Promise<void> {
    this.localAdapter = params.localAdapter;
    this.remoteAdapter = params.remoteAdapter;
    this.checkpointProvider = params.checkpointProvider;
    this.conflictHandler = params.conflictHandler;
    this.pendingQueue = params.pendingQueue;
    this.removeWinsHandler = params.removeWinsHandler;
  }

  public async execute(listName: string): Promise<void> {
    const lastCheckpoint = await this.checkpointProvider.getCheckpoint(listName);

    const dataUnsubscribe = this.remoteAdapter.watchList(
      listName,
      (remoteItems) => this.handleDataUpdate(listName, remoteItems),
      lastCheckpoint
    );

    const deletedUnsubscribe = this.remoteAdapter.watchDeletedEntries(
      listName,
      (entries) => this.handleDeletedUpdate(listName, entries)
    );

    this.unsubscribes.set(listName, [dataUnsubscribe, deletedUnsubscribe]);

    await this.pushChanges(listName);
  }

  private async handleDataUpdate(listName: string, remoteItems: T[]): Promise<void> {
    if (remoteItems.length === 0) return;

    const localItems = await this.localAdapter.findMany(listName, remoteItems.map(i => i.id));
    const localItemsMap = new Map(localItems.map(item => [item.id, item]));

    const toAdd: T[] = [];
    const toUpdate: (Partial<T> & { id: string })[] = [];

    for (const remoteItem of remoteItems) {
      const localItem = localItemsMap.get(remoteItem.id);
      if (!localItem) {
        toAdd.push(remoteItem);
      } else {
        const resolved = this.conflictHandler.resolve(localItem, remoteItem);
        if (resolved === remoteItem) {
          toUpdate.push(remoteItem);
        }
      }
    }

    if (toAdd.length > 0) await this.localAdapter.addMany(listName, toAdd);
    if (toUpdate.length > 0) await this.localAdapter.updateMany(listName, toUpdate);

    const newCheckpoint = Math.max(...remoteItems.map(item => item.updatedAt));
    await this.checkpointProvider.updateCheckpoint(listName, newCheckpoint);
  }

  private async handleDeletedUpdate(listName: string, entries: DeleteEntry[]): Promise<void> {
    this.deletedEntries.set(listName, entries);

    await this.removeWinsHandler.garbageCollect(listName, entries);
  }

  private async pushChanges(listName: string): Promise<void> {
    const pendingOperations = this.pendingQueue.all;
    if (pendingOperations.length === 0) return;

    const deleted = this.deletedEntries.get(listName) || [];
    const operations: OperationsMap<T> = new Map();
    for (const op of pendingOperations) {
      const itemId = (op.item as { id: string }).id;
      if (!this.removeWinsHandler.isDeleted(itemId, deleted)) {
        operations.set(itemId, op);
      }
    }

    if (operations.size > 0) {
      await this.remoteAdapter.mutate(listName, operations);
      this.pendingQueue.clear();
    }
  }

  public async cleanup(listName: string): Promise<void> {
    const listUnsubscribes = this.unsubscribes.get(listName);
    if (listUnsubscribes) {
      listUnsubscribes.forEach(unsubscribe => unsubscribe());
      this.unsubscribes.delete(listName);
      this.deletedEntries.delete(listName);
    }
  }
}
