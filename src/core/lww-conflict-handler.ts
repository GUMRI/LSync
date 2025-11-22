import { BaseItem } from '../interfaces/base-item';
import { IConflictHandler } from '../interfaces/conflict-handler';

export class LwwConflictHandler<T extends BaseItem> implements IConflictHandler<T> {
  public resolve(local: T, remote: T): T {
    // Last-Write-Wins: The item with the most recent updatedAt timestamp wins.
    return local.updatedAt > remote.updatedAt ? local : remote;
  }
}
