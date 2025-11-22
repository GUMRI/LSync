import { NetworkObserver } from './network-observer';

const CLIENT_ID_KEY = 'lsync_client_id';

export abstract class ClientProvider {
  protected clientId: string;
  protected networkObserver: NetworkObserver;

  constructor(networkObserver: NetworkObserver) {
    this.clientId = this.getClientId();
    this.networkObserver = networkObserver;
    this.networkObserver.subscribe(status => {
      if (status === 'online') {
        this.setOnline();
      } else {
        this.setOffline();
      }
    });
  }

  private getClientId(): string {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = this.generateUniqueId();
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  }

  private generateUniqueId(): string {
     return crypto.randomUUID();
  }

  public getCurrentClientId(): string {
    return this.clientId;
  }

  public cleanup(): void {
    this.networkObserver.cleanup();
  }

  abstract setOnline(): Promise<void>;
  abstract setOffline(): Promise<void>;
  abstract getOfflineClients(): Promise<string[]>;
}
