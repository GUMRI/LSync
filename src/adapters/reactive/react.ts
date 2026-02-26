import { useSyncExternalStore } from 'react';
import { ReactiveAdapter, ReactiveValue, StopFn } from '../../uni-reactive/types';
import { VanillaAdapter } from './vanilla';

/**
 * A reactive adapter for React.
 * Since React is not natively fine-grained, this adapter uses the Vanilla
 * reactive engine as a backend and provides a hook to bridge into React's
 * rendering cycle via useSyncExternalStore.
 */
export const ReactAdapter: ReactiveAdapter = {
  source: VanillaAdapter.source,
  derive: VanillaAdapter.derive,
  watch: VanillaAdapter.watch,
};

/**
 * A hook to use a reactive value (source or derive) inside a React component.
 * This is the React-specific way to bridge the unified API.
 *
 * @param value The reactive value to subscribe to.
 * @returns The current value, triggering a re-render when it changes.
 */
export function useReactiveValue<T>(value: ReactiveValue<T>): T {
  // If the value has a subscribe method (provided by VanillaAdapter), use it.
  if (typeof (value as any).subscribe === 'function') {
    return useSyncExternalStore(
      (l) => (value as any).subscribe(l),
      () => value()
    );
  }

  // Fallback for non-vanilla values if mixed
  return value();
}
