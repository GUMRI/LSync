import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BootstrapSyncStrategy } from './bootstrap-sync-strategy';
import { MockLocalAdapter } from '../__mocks__/local-adapter.mock';
import { MockRemoteAdapter } from '../__mocks__/remote-adapter.mock';
import { BaseItem } from '../interfaces';
import { LwwConflictHandler, PendingQueue, RemoveWinsHandler, CheckpointProvider } from '../core';

interface TestItem extends BaseItem { name: string }

describe('BootstrapSyncStrategy', () => {
  let localAdapter: MockLocalAdapter<TestItem>;
  let remoteAdapter: MockRemoteAdapter<TestItem>;
  let strategy: BootstrapSyncStrategy<TestItem>;

  beforeEach(() => {
    localAdapter = new MockLocalAdapter();
    remoteAdapter = new MockRemoteAdapter();
    strategy = new BootstrapSyncStrategy(
      new LwwConflictHandler(),
      new PendingQueue(),
      new RemoveWinsHandler(remoteAdapter),
      new CheckpointProvider(localAdapter)
    );
    strategy.setup({ localAdapter, remoteAdapter } as any);
  });

  it('should use a transaction if the adapter provides one', async () => {
    const transactionFn = vi.fn(async (executor) => await executor('TRANSACTION_OBJECT'));
    remoteAdapter.transaction = transactionFn;

    vi.spyOn(strategy as any, 'pullChanges').mockResolvedValue(undefined);
    vi.spyOn(strategy as any, 'pushChanges').mockResolvedValue(undefined);

    await strategy.execute('testList');

    expect(transactionFn).toHaveBeenCalledOnce();
    expect((strategy as any).pullChanges).toHaveBeenCalledWith('testList', 'TRANSACTION_OBJECT');
    expect((strategy as any).pushChanges).toHaveBeenCalledWith('testList', 'TRANSACTION_OBJECT');
  });

  it('should execute without a transaction if not provided', async () => {
    remoteAdapter.transaction = undefined;

    vi.spyOn(strategy as any, 'pullChanges').mockResolvedValue(undefined);
    vi.spyOn(strategy as any, 'pushChanges').mockResolvedValue(undefined);

    await strategy.execute('testList');

    expect((strategy as any).pullChanges).toHaveBeenCalledWith('testList', undefined);
    expect((strategy as any).pushChanges).toHaveBeenCalledWith('testList', undefined);
  });
});
