import { BaseItem, Operation } from '../interfaces';

export class PendingQueue<T extends BaseItem> {
  private queue: Operation<T>[] = [];

  public enqueue(operation: Operation<T>): void {
    // Remove any existing operation for the same item ID
    const itemId = (operation.item as { id: string }).id;
    this.remove(itemId);
    this.queue.push(operation);
  }

  public dequeue(): Operation<T> | undefined {
    return this.queue.shift();
  }

  public remove(id: string): void {
    this.queue = this.queue.filter(op => (op.item as { id: string }).id !== id);
  }

  public get all(): Operation<T>[] {
    return [...this.queue];
  }

  public get size(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
  }
}
