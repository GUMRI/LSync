import {
  BaseItem,
  ILocalSyncAdapter,
  ISyncAdapter,
} from './';
import {
  CheckpointProvider,
  LwwConflictHandler,
  PendingQueue,
  RemoveWinsHandler,
} from '../core';

export interface ISyncStrategySetupParams<T extends BaseItem> {
  localAdapter: ILocalSyncAdapter<T>;
  remoteAdapter: ISyncAdapter<T>;
  checkpointProvider: CheckpointProvider;
  conflictHandler: LwwConflictHandler<T>;
  pendingQueue: PendingQueue<T>;
  removeWinsHandler: RemoveWinsHandler<T>;
}

export interface ISyncStrategy<T extends BaseItem> {
  setup(params: ISyncStrategySetupParams<T>): Promise<void>;
  execute(listName: string): Promise<void>;
  cleanup(listName: string): Promise<void>;
}
