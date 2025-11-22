import { LocalAdapter, RemoteAdapter } from '../adapters';
import { BaseItem } from '../interfaces';
import { NetworkObserver } from './network-observer';

export class ClientProvider {
  private localAdapter: LocalAdapter<BaseItem>;
  private remoteAdapter: RemoteAdapter<BaseItem>;
  private networkObserver: NetworkObserver;
  private clientId: string | null = null;

  constructor(
    localAdapter: LocalAdapter<BaseItem>,
    remoteAdapter: RemoteAdapter<BaseItem>,
    networkObserver: NetworkObserver
  ) {
    this.localAdapter = localAdapter;
    this.remoteAdapter = remoteAdapter;
    this.networkObserver = networkObserver;

    this.initialize();
    this.networkObserver.subscribe(this.handleNetworkChange);
  }

  private async initialize(): Promise<void> {
    this.clientId = await this.localAdapter.getClientId();
    if (!this.clientId) {
      this.clientId = crypto.randomUUID();
      await this.localAdapter.setClientId(this.clientId);
    }
    this.handleNetworkChange(this.networkObserver.isOnline ? 'online' : 'offline');
  }

  private handleNetworkChange = async (status: 'online' | 'offline'): Promise<void> => {
    if (!this.clientId) return;

    if (status === 'online') {
      await this.remoteAdapter.deleteOfflineClient(this.clientId);
    } else {
      await this.remoteAdapter.setOfflineClient(this.clientId);
    }
  };

  public async getCurrentClientId(): Promise<string> {
    if (!this.clientId) {
      throw new Error('ClientProvider not initialized.');
    }
    return this.clientId;
  }

  public getOfflineClients(): Promise<string[]> {
    return this.remoteAdapter.getOfflineClients();
  }
}
