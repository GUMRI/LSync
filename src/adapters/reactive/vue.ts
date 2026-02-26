import { ref, computed, watchEffect, Ref } from 'vue';
import { ReactiveAdapter, ReactiveSource, ReactiveValue, EffectFn, StopFn } from '../../uni-reactive/types';

/**
 * A reactive adapter for Vue 3.
 * Uses Vue's native ref, computed, and watchEffect.
 */
export const VueAdapter: ReactiveAdapter = {
  source<T>(initialValue: T): ReactiveSource<T> {
    const v = ref(initialValue) as Ref<T>;
    const res = (() => v.value) as ReactiveSource<T>;
    res.set = (val: T) => {
      v.value = val;
    };
    res.update = (updater: (prev: T) => T) => {
      v.value = updater(v.value);
    };
    return res;
  },

  derive<T>(fn: () => T): ReactiveValue<T> {
    const c = computed(fn);
    return () => c.value;
  },

  watch(fn: EffectFn): StopFn {
    const stop = watchEffect((onCleanup) => {
      const cleanup = fn();
      if (cleanup) onCleanup(cleanup);
    });
    return stop;
  },
};
