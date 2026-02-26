import { ReactiveAdapter, ReactiveSource, ReactiveValue, EffectFn, StopFn } from '../../uni-reactive/types';

let activeEffect: (() => void) | null = null;

/**
 * A minimal reactive system for plain JavaScript environments.
 * This serves as a reference implementation and a fallback for non-framework environments.
 */
export const VanillaAdapter: ReactiveAdapter = {
  source<T>(initialValue: T): ReactiveSource<T> {
    let val = initialValue;
    const subscribers = new Set<() => void>();

    const res = (() => {
      if (activeEffect) {
        subscribers.add(activeEffect);
      }
      return val;
    }) as ReactiveSource<T>;

    res.set = (newVal: T) => {
      if (val !== newVal) {
        val = newVal;
        const toNotify = Array.from(subscribers);
        subscribers.clear();
        toNotify.forEach((sub) => sub());
      }
    };

    res.update = (updater: (prev: T) => T) => {
      res.set(updater(val));
    };

    // Extension for bridges like React
    (res as any).subscribe = (l: () => void) => {
      subscribers.add(l);
      return () => subscribers.delete(l);
    };

    return res;
  },

  derive<T>(fn: () => T): ReactiveValue<T> {
    let cachedValue: T;
    let isDirty = true;
    const subscribers = new Set<() => void>();

    const markDirty = () => {
      if (!isDirty) {
        isDirty = true;
        const toNotify = Array.from(subscribers);
        subscribers.clear();
        toNotify.forEach((sub) => sub());
      }
    };

    const res = (() => {
      if (activeEffect) {
        subscribers.add(activeEffect);
      }

      if (isDirty) {
        const prevEffect = activeEffect;
        activeEffect = markDirty;
        try {
          cachedValue = fn();
          isDirty = false;
        } finally {
          activeEffect = prevEffect;
        }
      }
      return cachedValue;
    }) as ReactiveValue<T>;

    // Extension for bridges like React
    (res as any).subscribe = (l: () => void) => {
      subscribers.add(l);
      return () => subscribers.delete(l);
    };

    return res;
  },

  watch(fn: EffectFn): StopFn {
    let cleanup: void | StopFn;
    let stopped = false;

    const run = () => {
      if (stopped) return;
      if (cleanup) {
        cleanup();
      }
      const prevEffect = activeEffect;
      activeEffect = run;
      try {
        cleanup = fn();
      } finally {
        activeEffect = prevEffect;
      }
    };

    run();

    return () => {
      stopped = true;
      if (cleanup) {
        cleanup();
      }
    };
  },
};
