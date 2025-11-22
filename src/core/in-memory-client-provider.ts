import { ClientProvider } from './client-provider';
import { NetworkObserver, NetworkStatus } from './network-observer';

const clientStatusStore = new Map<string, NetworkStatus>();

export class InMemoryClientProvider extends ClientProvider {
  constructor(networkObserver: NetworkObserver) {
    super(networkObserver);
    this.setOnline();
  }

  public async setOnline(): Promise<void> {
    clientStatusStore.set(this.clientId, 'online');
  }

  public async setOffline(): Promise<void> {
    clientStatusStore.set(this.clientId, 'offline');
  }

  public async getOfflineClients(): Promise<string[]> {
    const offlineClients: string[] = [];
    clientStatusStore.forEach((status, id) => {
      if (status === 'offline') {
        offlineClients.push(id);
      }
    });
    return offlineClients;
  }

  public static _clearClientStatusStoreForTesting(): void {
    clientStatusStore.clear();
  }
}
