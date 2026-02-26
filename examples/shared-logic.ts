import { source, derive, watch } from '../src/uni-reactive';

/**
 * A simple framework-agnostic Counter library built with UniReactive.
 * This library doesn't know about Vue, React, or Angular.
 */
export function createCounter(initialValue = 0) {
  const count = source(initialValue);
  const doubled = derive(() => count() * 2);

  const increment = () => count.update((v) => v + 1);
  const decrement = () => count.update((v) => v - 1);

  // An internal effect that works in any framework
  watch(() => {
    console.log(`[Shared Logic] Count is now: ${count()}, Doubled: ${doubled()}`);
  });

  return {
    count,
    doubled,
    increment,
    decrement,
  };
}
