export type NetworkStatus = 'online' | 'offline';

type StatusChangeListener = (status: NetworkStatus) => void;

export class NetworkObserver {
  private status: NetworkStatus;
  private listeners: Set<StatusChangeListener> = new Set();

  constructor() {
    this.status = navigator.onLine ? 'online' : 'offline';
    this.addEventListeners();
  }

  private addEventListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('beforeunload', this.handleUnload);
  }

  private handleOnline = (): void => {
    this.setStatus('online');
  };

  private handleOffline = (): void => {
    this.setStatus('offline');
  };

  private handleUnload = (): void => {
    // This is a last-ditch effort to notify that the client is offline.
    // The actual logic of setting the client's state will be in the ClientProvider.
    this.setStatus('offline');
  };

  private setStatus(newStatus: NetworkStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.listeners.forEach(listener => listener(this.status));
    }
  }

  public get isOnline(): boolean {
    return this.status === 'online';
  }

  public subscribe(listener: StatusChangeListener): () => void {
    this.listeners.add(listener);
    // Return an unsubscribe function
    return () => this.listeners.delete(listener);
  }

  public cleanup(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('beforeunload', this.handleUnload);
    this.listeners.clear();
  }
}
