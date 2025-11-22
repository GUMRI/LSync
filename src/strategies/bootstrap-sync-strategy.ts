import { BaseItem } from '../interfaces/base-item';
import { ISyncAdapter } from '../interfaces/sync-adapter';
import { ISyncStrategy } from '../interfaces/sync-strategy';
import { LwwConflictHandler } from '../core/lww-conflict-handler';
import { PendingQueue } from '../core/pending-queue';
import { RemoveWinsHandler } from '../core/remove-wins-handler';
import { CheckpointProvider } from '../core/checkpoint-provider';
import { ILocalSyncAdapter } from '../interfaces/local-sync-adapter';

export class BootstrapSyncStrategy<T extends BaseItem> implements ISyncStrategy<T> {
  private localAdapter!: ILocalSyncAdapter<T>;
  private remoteAdapter!: ISyncAdapter<T>;
  private conflictHandler: LwwConflictHandler<T>;
  private pendingQueue: PendingQueue<T>;
  private removeWinsHandler: RemoveWinsHandler<T>;
  private checkpointProvider: CheckpointProvider;

  constructor(
    conflictHandler: LwwConflictHandler<T>,
    pendingQueue: PendingQueue<T>,
    removeWinsHandler: RemoveWinsHandler<T>,
    checkpointProvider: CheckpointProvider
  ) {
    this.conflictHandler = conflictHandler;
    this.pendingQueue = pendingQueue;
    this.removeWinsHandler = removeWinsHandler;
    this.checkpointProvider = checkpointProvider;
  }

  public async setup(localAdapter: ILocalSyncAdapter<T>, remoteAdapter: ISyncAdapter<T>): Promise<void> {
    this.localAdapter = localAdapter;
    this.remoteAdapter = remoteAdapter;
  }

  /**
   * Executes the bootstrap synchronization process.
   * Note: This method provides a logical transaction. True atomicity depends
   * on the underlying adapter implementations (e.g., using a database transaction).
   */
  public async execute(): Promise<void> {
    try {
      // PULL PHASE
      const lastCheckpoint = await this.checkpointProvider.getCheckpoint();
      const remoteItems = await this.remoteAdapter.fetchItems(lastCheckpoint ?? 0);

      const localItems = await this.localAdapter.fetchItems();
      const localItemsMap = new Map(localItems.map(item => [item.id, item]));

      const resolvedItems: T[] = [];
      for (const remoteItem of remoteItems) {
        const localItem = localItemsMap.get(remoteItem.id);
        if (localItem) {
          resolvedItems.push(this.conflictHandler.resolve(localItem, remoteItem));
        } else {
          resolvedItems.push(remoteItem);
        }
      }
      await this.localAdapter.saveItems(resolvedItems);

      // PUSH PHASE
      const pendingItems = this.pendingQueue.all;
      const itemsToPush: T[] = [];
      for (const item of pendingItems) {
        if (!(await this.removeWinsHandler.isDeleted(item.id))) {
          itemsToPush.push(item);
        }
      }
      if (itemsToPush.length > 0) {
        await this.remoteAdapter.saveItems(itemsToPush);
        this.pendingQueue.clear();
      }

      // UPDATE CHECKPOINT
      if (remoteItems.length > 0) {
        const newCheckpoint = Math.max(...remoteItems.map(item => item.updatedAt));
        await this.checkpointProvider.updateCheckpoint(newCheckpoint);
      }

    } catch (error) {
      console.error('Bootstrap sync failed:', error);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    // No specific cleanup needed for this strategy
  }
}
