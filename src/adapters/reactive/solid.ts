import { createSignal, createMemo, createEffect, onCleanup, createRoot } from 'solid-js';
import { ReactiveAdapter, ReactiveSource, ReactiveValue, EffectFn, StopFn } from '../../uni-reactive/types';

/**
 * A reactive adapter for Solid.js.
 * Uses Solid's native createSignal, createMemo, and createEffect.
 */
export const SolidAdapter: ReactiveAdapter = {
  source<T>(initialValue: T): ReactiveSource<T> {
    const [get, set] = createSignal(initialValue);
    const res = (() => get()) as ReactiveSource<T>;
    res.set = (val: T) => set(() => val);
    res.update = (updater: (prev: T) => T) => set(updater);
    return res;
  },

  derive<T>(fn: () => T): ReactiveValue<T> {
    const c = createMemo(fn);
    return () => c();
  },

  watch(fn: EffectFn): StopFn {
    let dispose: StopFn;
    createRoot((disp) => {
      createEffect(() => {
        const cleanup = fn();
        if (cleanup) onCleanup(cleanup);
      });
      dispose = disp;
    });
    return dispose!;
  },
};
