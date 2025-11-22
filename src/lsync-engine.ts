import { BaseItem } from './interfaces/base-item';
import { ISyncAdapter } from './interfaces/sync-adapter';
import { ISyncStrategy } from './interfaces/sync-strategy';
import { RemoveWinsHandler } from './core/remove-wins-handler';
import { ClientProvider } from './core/client-provider';
import { NetworkObserver } from './core/network-observer';
import { ILocalSyncAdapter } from './interfaces/local-sync-adapter';

interface LSyncEngineConfig<T extends BaseItem> {
  localAdapter: ILocalSyncAdapter<T>;
  remoteAdapter: ISyncAdapter<T>;
  strategy: ISyncStrategy<T>;
  clientProvider: ClientProvider;
  networkObserver: NetworkObserver;
}

export class LSyncEngine<T extends BaseItem> {
  private localAdapter: ILocalSyncAdapter<T>;
  private remoteAdapter: ISyncAdapter<T>;
  private strategy: ISyncStrategy<T>;
  private clientProvider: ClientProvider;
  private removeWinsHandler: RemoveWinsHandler<T>;
  private networkObserver: NetworkObserver;
  private isRunning: boolean = false;

  constructor(config: LSyncEngineConfig<T>) {
    this.localAdapter = config.localAdapter;
    this.remoteAdapter = config.remoteAdapter;
    this.strategy = config.strategy;
    this.clientProvider = config.clientProvider;
    this.networkObserver = config.networkObserver;

    this.removeWinsHandler = new RemoveWinsHandler(this.localAdapter, this.clientProvider);

    this.networkObserver.subscribe(this.handleNetworkChange);
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('LSyncEngine is already running.');
      return;
    }
    await this.strategy.setup(this.localAdapter, this.remoteAdapter);
    this.isRunning = true;
    console.log('LSyncEngine started.');
    // Initial sync
    await this.sync();
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    await this.strategy.cleanup();
    this.networkObserver.cleanup();
    this.isRunning = false;
    console.log('LSyncEngine stopped.');
  }

  private async sync(): Promise<void> {
    if (this.networkObserver.isOnline) {
      await this.strategy.execute();
    } else {
      console.log('Client is offline. Sync deferred.');
    }
  }

  public async delete(ids: string[]): Promise<void> {
    await Promise.all([
      ...ids.map(id => this.localAdapter.deleteItem(id)),
      ...ids.map(id => this.remoteAdapter.deleteItem(id)),
    ]);
    await this.removeWinsHandler.handleDelete(ids);
  }

  private handleNetworkChange = (status: 'online' | 'offline'): void => {
    if (status === 'online') {
      this.removeWinsHandler.handleClientOnline();
      this.sync();
    }
  };
}
