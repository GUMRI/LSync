export interface DeleteEntry {
  id: string; // Unique ID for the delete log itself
  ids: string[]; // IDs of the deleted items
  pendingClients: string[];
}
