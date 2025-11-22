import { describe, it, expect } from 'vitest';
import { PendingQueue } from './pending-queue';
import { BaseItem, Operation } from '../interfaces';

interface TestItem extends BaseItem { name: string }

describe('PendingQueue', () => {
  it('should enqueue and dequeue operations correctly', () => {
    const queue = new PendingQueue<TestItem>();
    const op1: Operation<TestItem> = { type: 'add', item: { id: '1', name: 'item1', updatedAt: 1 } };
    const op2: Operation<TestItem> = { type: 'add', item: { id: '2', name: 'item2', updatedAt: 2 } };

    queue.enqueue(op1);
    queue.enqueue(op2);

    expect(queue.size).toBe(2);
    expect(queue.dequeue()).toBe(op1);
    expect(queue.size).toBe(1);
    expect(queue.dequeue()).toBe(op2);
    expect(queue.size).toBe(0);
  });

  it('should remove operations by id', () => {
    const queue = new PendingQueue<TestItem>();
    const op1: Operation<TestItem> = { type: 'add', item: { id: '1', name: 'item1', updatedAt: 1 } };
    const op2: Operation<TestItem> = { type: 'add', item: { id: '2', name: 'item2', updatedAt: 2 } };

    queue.enqueue(op1);
    queue.enqueue(op2);
    queue.remove('1');

    expect(queue.size).toBe(1);
    expect(queue.dequeue()).toBe(op2);
  });

  it('should clear all operations', () => {
    const queue = new PendingQueue<TestItem>();
    const op1: Operation<TestItem> = { type: 'add', item: { id: '1', name: 'item1', updatedAt: 1 } };
    queue.enqueue(op1);

    queue.clear();
    expect(queue.size).toBe(0);
  });
});
