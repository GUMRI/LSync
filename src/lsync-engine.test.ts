import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LSyncEngine } from './lsync-engine';
import { MockLocalAdapter } from './__mocks__/local-adapter.mock';
import { MockRemoteAdapter } from './__mocks__/remote-adapter.mock';
import { BootstrapSyncStrategy } from './strategies';
import { BaseItem, OperationsMap } from './interfaces';

// Mock the strategy
vi.mock('./strategies/bootstrap-sync-strategy');

interface TestItem extends BaseItem { name: string }

describe('LSyncEngine', () => {
  let localAdapter: MockLocalAdapter<TestItem>;
  let remoteAdapter: MockRemoteAdapter<TestItem>;
  let strategy: BootstrapSyncStrategy<TestItem>;
  let engine: LSyncEngine<TestItem>;

  beforeEach(() => {
    localAdapter = new MockLocalAdapter();
    remoteAdapter = new MockRemoteAdapter();
    strategy = new BootstrapSyncStrategy(null as any, null as any, null as any, null as any);
    engine = new LSyncEngine({ localAdapter, remoteAdapter, strategy });
  });

  it('should push mutations directly when online', async () => {
    vi.spyOn(engine['networkObserver'], 'isOnline', 'get').mockReturnValue(true);

    const operations: OperationsMap<TestItem> = new Map([
      ['id1', { type: 'add', item: { id: 'id1', name: 'test', updatedAt: 1 } }]
    ]);

    await engine.mutate('testList', operations);

    expect(remoteAdapter.mutate).toHaveBeenCalledWith('testList', operations);
  });

  it('should queue mutations when offline', async () => {
    vi.spyOn(engine['networkObserver'], 'isOnline', 'get').mockReturnValue(false);

    const operations: OperationsMap<TestItem> = new Map([
      ['id1', { type: 'add', item: { id: 'id1', name: 'test', updatedAt: 1 } }]
    ]);

    await engine.mutate('testList', operations);

    expect(remoteAdapter.mutate).not.toHaveBeenCalled();
    expect(engine['pendingQueue'].size).toBe(1);
    expect(engine['pendingQueue'].all[0].type).toBe('add');
  });

  it('should queue delete mutations when offline', async () => {
    vi.spyOn(engine['networkObserver'], 'isOnline', 'get').mockReturnValue(false);

    const operations: OperationsMap<TestItem> = new Map([
      ['id1', { type: 'delete', item: { id: 'id1' } }]
    ]);

    await engine.mutate('testList', operations);

    expect(remoteAdapter.mutate).not.toHaveBeenCalled();
    expect(remoteAdapter.upsertDeletedEntry).not.toHaveBeenCalled();
    expect(engine['pendingQueue'].size).toBe(1);
    expect(engine['pendingQueue'].all[0].type).toBe('delete');
  });

  it('should create a delete entry on delete mutation when online', async () => {
    vi.spyOn(engine['networkObserver'], 'isOnline', 'get').mockReturnValue(true);
    remoteAdapter.offlineClients.add('client2');
    const operations: OperationsMap<TestItem> = new Map([
      ['id1', { type: 'delete', item: { id: 'id1' } }]
    ]);

    await engine.mutate('testList', operations);

    expect(remoteAdapter.upsertDeletedEntry).toHaveBeenCalledOnce();
  });
});
