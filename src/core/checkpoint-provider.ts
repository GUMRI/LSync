import { LocalAdapter } from '../adapters/local-adapter';
import { BaseItem } from '../interfaces/base-item';

export class CheckpointProvider {
  private localAdapter: LocalAdapter<BaseItem>;
  private checkpoint: number | null = null;

  constructor(localAdapter: LocalAdapter<BaseItem>) {
    this.localAdapter = localAdapter;
  }

  public async getCheckpoint(): Promise<number | null> {
    if (this.checkpoint === null) {
      this.checkpoint = await this.localAdapter.getCheckpoint();
    }
    return this.checkpoint;
  }

  public async updateCheckpoint(newCheckpoint: number): Promise<void> {
    this.checkpoint = newCheckpoint;
    await this.localAdapter.updateCheckpoint(newCheckpoint);
  }
}
