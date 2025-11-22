import { BaseItem, DeleteEntry, RemoteAdapter } from '../interfaces';

export class RemoveWinsHandler<T extends BaseItem> {
  private remoteAdapter: RemoteAdapter<T>;

  constructor(remoteAdapter: RemoteAdapter<T>) {
    this.remoteAdapter = remoteAdapter;
  }

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public async createDeleteEntry(
    listName: string,
    ids: string[],
    offlineClients: string[]
  ): Promise<void> {
    if (offlineClients.length === 0) {
      return;
    }

    const deleteEntry: DeleteEntry = {
      id: this.generateUniqueId(),
      ids,
      pendingClients: offlineClients,
    };
    await this.remoteAdapter.upsertDeletedEntry(listName, deleteEntry);
  }

  public handleClientOnline(listName: string, clientId: string): () => void {
    const unsubscribe = this.remoteAdapter.watchDeletedEntries(
      listName,
      async (entries) => {
        for (const entry of entries) {
          const clientIndex = entry.pendingClients.indexOf(clientId);
          if (clientIndex > -1) {
            entry.pendingClients.splice(clientIndex, 1);
            await this.remoteAdapter.upsertDeletedEntry(listName, entry);
          }
        }
      }
    );
    return unsubscribe;
  }

  public isDeleted(id: string, deletedEntries: DeleteEntry[]): boolean {
    return deletedEntries.some(entry => entry.ids.includes(id));
  }

  public async garbageCollect(listName: string, entries: DeleteEntry[]): Promise<void> {
    for (const entry of entries) {
      if (entry.pendingClients.length === 0) {
        await this.remoteAdapter.deleteDeletedEntry(listName, entry.id);
      }
    }
  }
}
