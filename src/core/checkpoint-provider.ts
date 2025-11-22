import { LocalAdapter } from '../adapters';
import { BaseItem } from '../interfaces';

export class CheckpointProvider {
  private localAdapter: LocalAdapter<BaseItem>;
  private checkpoints: Map<string, number | null> = new Map();

  constructor(localAdapter: LocalAdapter<BaseItem>) {
    this.localAdapter = localAdapter;
  }

  public async getCheckpoint(listName: string): Promise<number | null> {
    if (!this.checkpoints.has(listName)) {
      const checkpoint = await this.localAdapter.getCheckpoint(listName);
      this.checkpoints.set(listName, checkpoint);
    }
    return this.checkpoints.get(listName) || null;
  }

  public async updateCheckpoint(listName: string, newCheckpoint: number): Promise<void> {
    this.checkpoints.set(listName, newCheckpoint);
    await this.localAdapter.upsertCheckpoint(listName, newCheckpoint);
  }
}
