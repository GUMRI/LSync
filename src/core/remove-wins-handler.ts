import { BaseItem } from '../interfaces/base-item';
import { DeleteEntry } from '../interfaces/delete-entry';
import { ClientProvider } from './client-provider';
import { ILocalSyncAdapter } from '../interfaces/local-sync-adapter';

export class RemoveWinsHandler<T extends BaseItem> {
  private localAdapter: ILocalSyncAdapter<T>;
  private clientProvider: ClientProvider;

  constructor(
    localAdapter: ILocalSyncAdapter<T>,
    clientProvider: ClientProvider
  ) {
    this.localAdapter = localAdapter;
    this.clientProvider = clientProvider;
  }

  private generateUniqueId(): string {
     return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public async handleDelete(ids: string[]): Promise<void> {
    const offlineClients = await this.clientProvider.getOfflineClients();
    if (offlineClients.length > 0) {
      const deleteEntry: DeleteEntry = {
        id: this.generateUniqueId(),
        ids,
        pendingClients: offlineClients,
      };
      await this.localAdapter.createDeleteEntry(deleteEntry);
    }
  }

  public async handleClientOnline(): Promise<void> {
    const clientId = this.clientProvider.getCurrentClientId();
    const deleteEntries = await this.localAdapter.fetchDeleteEntries();

    for (const entry of deleteEntries) {
      const index = entry.pendingClients.indexOf(clientId);
      if (index > -1) {
        entry.pendingClients.splice(index, 1);
        await this.localAdapter.updateDeleteEntry(entry);
      }
    }

    await this.garbageCollect();
  }

  public async isDeleted(id: string): Promise<boolean> {
    const deleteEntries = await this.localAdapter.fetchDeleteEntries();
    return deleteEntries.some(entry => entry.ids.includes(id));
  }

  private async garbageCollect(): Promise<void> {
    const deleteEntries = await this.localAdapter.fetchDeleteEntries();
    for (const entry of deleteEntries) {
      if (entry.pendingClients.length === 0) {
        await this.localAdapter.removeDeleteEntry(entry.id);
      }
    }
  }
}
