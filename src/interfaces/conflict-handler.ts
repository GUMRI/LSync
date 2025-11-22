import { BaseItem } from './base-item';

export interface IConflictHandler<T extends BaseItem> {
  resolve(local: T, remote: T): T;
}