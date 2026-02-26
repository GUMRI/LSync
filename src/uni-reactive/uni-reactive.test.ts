import { describe, it, expect, vi } from 'vitest';
import { setAdapter, source, derive, watch } from './index';
import { VanillaAdapter } from '../adapters/reactive/vanilla';

describe('UniReactive Core with VanillaAdapter', () => {
  setAdapter(VanillaAdapter);

  it('should create a source and read its value', () => {
    const count = source(0);
    expect(count()).toBe(0);

    count.set(10);
    expect(count()).toBe(10);
  });

  it('should update a source', () => {
    const count = source(5);
    count.update(n => n + 1);
    expect(count()).toBe(6);
  });

  it('should derive values', () => {
    const count = source(2);
    const doubled = derive(() => count() * 2);

    expect(doubled()).toBe(4);

    count.set(5);
    expect(doubled()).toBe(10);
  });

  it('should trigger watchers', () => {
    const count = source(0);
    const callback = vi.fn();

    watch(() => {
      callback(count());
    });

    expect(callback).toHaveBeenCalledWith(0);

    count.set(1);
    expect(callback).toHaveBeenCalledWith(1);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should handle cleanup in watchers', () => {
    const count = source(0);
    const cleanup = vi.fn();

    const stop = watch(() => {
      count(); // track
      return cleanup;
    });

    count.set(1);
    expect(cleanup).toHaveBeenCalledTimes(1);

    stop();
    count.set(2);
    // Should not trigger again after stop
    // Calls so far: 1 (from set(1) triggering run which calls previous cleanup)
    // Plus 1 (from stop() calling current cleanup)
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});
