import { describe, it, expect } from 'vitest';
import { PendingQueue } from './pending-queue';
import { BaseItem } from '../interfaces/base-item';

// Mock item type for testing
interface TestItem extends BaseItem {
  name: string;
}

describe('PendingQueue', () => {
  it('should enqueue and dequeue items correctly', () => {
    const queue = new PendingQueue<TestItem>();
    const item1: TestItem = { id: '1', name: 'item1', updatedAt: 1 };
    const item2: TestItem = { id: '2', name: 'item2', updatedAt: 2 };

    queue.enqueue(item1);
    queue.enqueue(item2);

    expect(queue.size).toBe(2);
    expect(queue.dequeue()).toBe(item1);
    expect(queue.size).toBe(1);
    expect(queue.dequeue()).toBe(item2);
    expect(queue.size).toBe(0);
  });

  it('should remove items by id', () => {
    const queue = new PendingQueue<TestItem>();
    const item1: TestItem = { id: '1', name: 'item1', updatedAt: 1 };
    const item2: TestItem = { id: '2', name: 'item2', updatedAt: 2 };

    queue.enqueue(item1);
    queue.enqueue(item2);
    queue.remove('1');

    expect(queue.size).toBe(1);
    expect(queue.dequeue()).toBe(item2);
  });

  it('should clear all items', () => {
    const queue = new PendingQueue<TestItem>();
    const item1: TestItem = { id: '1', name: 'item1', updatedAt: 1 };
    queue.enqueue(item1);

    queue.clear();
    expect(queue.size).toBe(0);
  });
});
