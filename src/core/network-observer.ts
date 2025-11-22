export type NetworkStatus = 'online' | 'offline';

type StatusChangeListener = (status: NetworkStatus) => void;

export class NetworkObserver {
  private status: NetworkStatus;
  private listeners: Set<StatusChangeListener> = new Set();
  private window: Window;

  constructor(win: Window | null = globalThis.window) {
    if (!win) {
      // Fallback for non-browser environments during testing
      this.window = { addEventListener: () => {}, removeEventListener: () => {} } as any;
      this.status = 'online';
    } else {
      this.window = win;
      this.status = this.window.navigator.onLine ? 'online' : 'offline';
    }
    this.addEventListeners();
  }

  private addEventListeners(): void {
    this.window.addEventListener('online', this.handleOnline);
    this.window.addEventListener('offline', this.handleOffline);
    this.window.addEventListener('beforeunload', this.handleUnload);
  }

  private handleOnline = (): void => {
    this.setStatus('online');
  };

  private handleOffline = (): void => {
    this.setStatus('offline');
  };

  private handleUnload = (): void => {
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
    return () => this.listeners.delete(listener);
  }

  public cleanup(): void {
    this.window.removeEventListener('online', this.handleOnline);
    this.window.removeEventListener('offline', this.handleOffline);
    this.window.removeEventListener('beforeunload', this.handleUnload);
    this.listeners.clear();
  }
}
