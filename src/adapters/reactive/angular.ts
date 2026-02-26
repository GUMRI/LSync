import { signal, computed, effect } from '@angular/core';
import { ReactiveAdapter, ReactiveSource, ReactiveValue, EffectFn, StopFn } from '../../uni-reactive/types';

/**
 * A reactive adapter for Angular.
 * Uses Angular's native signals, computed, and effect.
 */
export const AngularAdapter: ReactiveAdapter = {
  source<T>(initialValue: T): ReactiveSource<T> {
    const s = signal(initialValue);
    // Angular signal already provides set and update methods
    return s as unknown as ReactiveSource<T>;
  },

  derive<T>(fn: () => T): ReactiveValue<T> {
    const c = computed(fn);
    return c as unknown as ReactiveValue<T>;
  },

  watch(fn: EffectFn): StopFn {
    const effectRef = effect((onCleanup) => {
      const cleanup = fn();
      if (cleanup) onCleanup(cleanup);
    });
    return () => effectRef.destroy();
  },
};
