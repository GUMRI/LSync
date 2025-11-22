import { describe, it, expect } from 'vitest';
import { LwwConflictHandler } from './lww-conflict-handler';
import { BaseItem } from '../interfaces/base-item';

// Mock item type for testing
interface TestItem extends BaseItem {
  name: string;
}

describe('LwwConflictHandler', () => {
  const handler = new LwwConflictHandler<TestItem>();

  it('should resolve conflict with local item if it is newer', () => {
    const local: TestItem = { id: '1', name: 'local', updatedAt: 2 };
    const remote: TestItem = { id: '1', name: 'remote', updatedAt: 1 };

    const result = handler.resolve(local, remote);
    expect(result).toBe(local);
  });

  it('should resolve conflict with remote item if it is newer', () => {
    const local: TestItem = { id: '1', name: 'local', updatedAt: 1 };
    const remote: TestItem = { id: '1', name: 'remote', updatedAt: 2 };

    const result = handler.resolve(local, remote);
    expect(result).toBe(remote);
  });

  it('should resolve conflict with remote item if timestamps are equal', () => {
    const local: TestItem = { id: '1', name: 'local', updatedAt: 1 };
    const remote: TestItem = { id: '1', name: 'remote', updatedAt: 1 };

    const result = handler.resolve(local, remote);
    expect(result).toBe(remote);
  });
});
