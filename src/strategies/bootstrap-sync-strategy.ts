import {
  BaseItem,
  DeleteEntry,
  ILocalSyncAdapter,
  ISyncAdapter,
  ISyncStrategy,
  ISyncStrategySetupParams,
  OperationsMap,
} from '../interfaces';
import {
  CheckpointProvider,
  LwwConflictHandler,
  PendingQueue,
  RemoveWinsHandler,
} from '../core';

export class BootstrapSyncStrategy<T extends BaseItem> implements ISyncStrategy<T> {
  private localAdapter!: ILocalSyncAdapter<T>;
  private remoteAdapter!: ISyncAdapter<T>;
  private conflictHandler!: LwwConflictHandler<T>;
  private pendingQueue!: PendingQueue<T>;
  private removeWinsHandler!: RemoveWinsHandler<T>;
  private checkpointProvider!: CheckpointProvider;

  public async setup(params: ISyncStrategySetupParams<T>): Promise<void> {
    this.localAdapter = params.localAdapter;
    this.remoteAdapter = params.remoteAdapter;
    this.checkpointProvider = params.checkpointProvider;
    this.conflictHandler = params.conflictHandler;
    this.pendingQueue = params.pendingQueue;
    this.removeWinsHandler = params.removeWinsHandler;
  }

  public async execute(listName: string): Promise<void> {
    const executeSync = async (transaction?: unknown) => {
      await this.pullChanges(listName, transaction);
      await this.pushChanges(listName, transaction);
    };

    try {
      if (this.remoteAdapter.transaction) {
        await this.remoteAdapter.transaction(executeSync);
      } else {
        await executeSync();
      }
    } catch (error) {
      console.error(`[BootstrapSyncStrategy] Sync failed for ${listName}:`, error);
      throw error;
    }
  }

  private async pullChanges(listName: string, transaction?: unknown): Promise<void> {
    const lastCheckpoint = await this.checkpointProvider.getCheckpoint(listName);
    const remoteItems = await this.remoteAdapter.fetchList(listName, lastCheckpoint, transaction);

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

  private async pushChanges(listName: string, transaction?: unknown): Promise<void> {
    const pendingOperations = this.pendingQueue.all;
    if (pendingOperations.length === 0) return;

    const deletedEntries = await this.remoteAdapter.fetchDeletedEntries(listName, transaction);
    const operations: OperationsMap<T> = new Map();
    for (const op of pendingOperations) {
      const itemId = (op.item as { id: string }).id;
      if (!this.removeWinsHandler.isDeleted(itemId, deletedEntries)) {
        operations.set(itemId, op);
      }
    }

    if (operations.size > 0) {
      await this.remoteAdapter.mutate(listName, operations, transaction);
      this.pendingQueue.clear();
    }
  }

  public async cleanup(listName: string): Promise<void> {
    // No-op for bootstrap
  }
}
