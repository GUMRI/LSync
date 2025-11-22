import { BaseItem } from './base-item';
import { ISyncAdapter } from './sync-adapter';

export interface ISyncStrategy<T extends BaseItem> {
  setup(localAdapter: ISyncAdapter<T>, remoteAdapter: ISyncAdapter<T>): Promise<void>;
  execute(): Promise<void>;
  cleanup(): Promise<void>;
}