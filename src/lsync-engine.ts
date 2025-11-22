import {
  BaseItem,
  ILocalSyncAdapter,
  ISyncAdapter,
  ISyncStrategy,
  OperationsMap,
} from './interfaces';
import {
  CheckpointProvider,
  ClientProvider,
  LwwConflictHandler,
  NetworkObserver,
  PendingQueue,
  RemoveWinsHandler,
} from './core';

interface LSyncEngineConfig<T extends BaseItem> {
  localAdapter: ILocalSyncAdapter<T>;
  remoteAdapter: ISyncAdapter<T>;
  strategy: ISyncStrategy<T>;
}

export class LSyncEngine<T extends BaseItem> {
  private localAdapter: ILocalSyncAdapter<T>;
  private remoteAdapter: ISyncAdapter<T>;
  private strategy: ISyncStrategy<T>;

  // Core components
  private clientProvider: ClientProvider;
  private removeWinsHandler: RemoveWinsHandler<T>;
  private pendingQueue: PendingQueue<T>;
  private networkObserver: NetworkObserver;
  private conflictHandler: LwwConflictHandler<T>;
  private checkpointProvider: CheckpointProvider;

  private activeLists: Set<string> = new Set();

  constructor(config: LSyncEngineConfig<T>) {
    this.localAdapter = config.localAdapter;
    this.remoteAdapter = config.remoteAdapter;
    this.strategy = config.strategy;

    // Internal component setup
    this.networkObserver = new NetworkObserver();
    this.clientProvider = new ClientProvider(this.localAdapter, this.remoteAdapter, this.networkObserver);
    this.removeWinsHandler = new RemoveWinsHandler(this.remoteAdapter);
    this.pendingQueue = new PendingQueue<T>();
    this.checkpointProvider = new CheckpointProvider(this.localAdapter);
    this.conflictHandler = new LwwConflictHandler<T>();

    this.strategy.setup({
      localAdapter: this.localAdapter,
      remoteAdapter: this.remoteAdapter,
      checkpointProvider: this.checkpointProvider,
      conflictHandler: this.conflictHandler,
      pendingQueue: this.pendingQueue,
      removeWinsHandler: this.removeWinsHandler,
    });
  }

  public async start(listName: string): Promise<void> {
    if (this.activeLists.has(listName)) {
      console.warn(`LSyncEngine is already running for list: ${listName}.`);
      return;
    }
    this.activeLists.add(listName);
    await this.strategy.execute(listName);
    console.log(`LSyncEngine started for list: ${listName}.`);
  }

  public async stop(listName: string): Promise<void> {
    if (!this.activeLists.has(listName)) {
      return;
    }
    await this.strategy.cleanup(listName);
    this.activeLists.delete(listName);
    console.log(`LSyncEngine stopped for list: ${listName}.`);
  }

  public async mutate(listName: string, operations: OperationsMap<T>): Promise<void> {
    // Optimistic local update
    const toAdd = Array.from(operations.values()).filter(op => op.type === 'add').map(op => op.item as T);
    const toUpdate = Array.from(operations.values()).filter(op => op.type === 'update').map(op => op.item as Partial<T> & { id: string });
    const toDelete = Array.from(operations.values()).filter(op => op.type === 'delete').map(op => (op.item as { id: string }).id);

    if (toAdd.length > 0) await this.localAdapter.addMany(listName, toAdd);
    if (toUpdate.length > 0) await this.localAdapter.updateMany(listName, toUpdate);
    if (toDelete.length > 0) await this.localAdapter.deleteMany(listName, toDelete);

    if (this.networkObserver.isOnline) {
      await this.pushPendingChanges(listName);
      await this.remoteAdapter.mutate(listName, operations);
      if (toDelete.length > 0) {
        const offlineClients = await this.clientProvider.getOfflineClients();
        await this.removeWinsHandler.createDeleteEntry(listName, toDelete, offlineClients);
      }
    } else {
      // If offline, queue all operations
      operations.forEach(op => this.pendingQueue.enqueue(op));
    }
  }

  private async pushPendingChanges(listName: string): Promise<void> {
    if (this.pendingQueue.size === 0) return;

    const operations: OperationsMap<T> = new Map();
    this.pendingQueue.all.forEach(op => {
      const itemId = (op.item as { id: string }).id;
      operations.set(itemId, op);
    });

    await this.remoteAdapter.mutate(listName, operations);
    this.pendingQueue.clear();
  }
}
