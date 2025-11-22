import { vi } from 'vitest';
import { BaseItem, DeleteEntry, ISyncAdapter, OperationsMap, Unsubscribe, WatchCallback } from '../interfaces';

export class MockRemoteAdapter<T extends BaseItem> implements ISyncAdapter<T> {
  public data: Map<string, T> = new Map();
  public deletedEntries: Map<string, DeleteEntry> = new Map();
  public offlineClients: Set<string> = new Set();

  private watchers: Map<string, WatchCallback<T>> = new Map();
  private deletedWatchers: Map<string, WatchCallback<DeleteEntry>> = new Map();

  fetchList = vi.fn(async (listName: string, checkpoint?: number | null): Promise<T[]> => {
    return Array.from(this.data.values()).filter(i => i.updatedAt > (checkpoint || 0));
  });

  watchList = vi.fn((listName: string, callback: WatchCallback<T>, checkpoint?: number | null): Unsubscribe => {
    this.watchers.set(listName, callback);
    // Immediately call back with initial data
    this.fetchList(listName, checkpoint).then(data => callback(data));
    return () => this.watchers.delete(listName);
  });

  mutate = vi.fn(async (listName: string, operations: OperationsMap<T>): Promise<void> => {
    operations.forEach((op, id) => {
      if (op.type === 'add' || op.type === 'update') {
        this.data.set(id, op.item as T);
      } else if (op.type === 'delete') {
        this.data.delete(id);
      }
    });
    // Notify watchers
    this.watchers.get(listName)?.(Array.from(this.data.values()));
  });

  setOfflineClient = vi.fn(async (clientId: string): Promise<void> => {
    this.offlineClients.add(clientId);
  });

  deleteOfflineClient = vi.fn(async (clientId: string): Promise<void> => {
    this.offlineClients.delete(clientId);
  });

  getOfflineClients = vi.fn(async (): Promise<string[]> => {
    return Array.from(this.offlineClients);
  });

  upsertDeletedEntry = vi.fn(async (listName: string, entry: DeleteEntry): Promise<void> => {
    this.deletedEntries.set(entry.id, entry);
    this.deletedWatchers.get(listName)?.(Array.from(this.deletedEntries.values()));
  });

  deleteDeletedEntry = vi.fn(async (listName: string, id: string): Promise<void> => {
    this.deletedEntries.delete(id);
    this.deletedWatchers.get(listName)?.(Array.from(this.deletedEntries.values()));
  });

  watchDeletedEntries = vi.fn((listName: string, callback: WatchCallback<DeleteEntry>): Unsubscribe => {
    this.deletedWatchers.set(listName, callback);
    callback(Array.from(this.deletedEntries.values()));
    return () => this.deletedWatchers.delete(listName);
  });

  fetchDeletedEntries = vi.fn(async (listName: string): Promise<DeleteEntry[]> => {
    return Array.from(this.deletedEntries.values());
  });

  // Helper for tests
  _clear() {
    this.data.clear();
    this.deletedEntries.clear();
    this.offlineClients.clear();
    this.watchers.clear();
    this.deletedWatchers.clear();
  }
}
