import { BaseItem } from '../interfaces/base-item';

export class PendingQueue<T extends BaseItem> {
  private queue: T[] = [];

  public enqueue(item: T): void {
    this.remove(item.id);
    this.queue.push(item);
  }

  public dequeue(): T | undefined {
    return this.queue.shift();
  }

  public remove(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
  }

  public get all(): T[] {
    return [...this.queue];
  }

  public get size(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
  }
}
