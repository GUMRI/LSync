import { ReactiveAdapter, ReactiveSource, ReactiveValue, EffectFn, StopFn } from './types';

let currentAdapter: ReactiveAdapter | null = null;

/**
 * Sets the active reactive adapter for the library.
 * This should be called once at the entry point of your application.
 * @param adapter The adapter for the current framework (e.g., VueAdapter, ReactAdapter).
 */
export function setAdapter(adapter: ReactiveAdapter) {
  currentAdapter = adapter;
}

/**
 * Returns the current reactive adapter.
 */
export function getAdapter(): ReactiveAdapter {
  if (!currentAdapter) {
    throw new Error(
      'UniReactive: No reactive adapter set. Use setAdapter(adapter) before calling reactive functions.'
    );
  }
  return currentAdapter;
}

/**
 * Creates a reactive source of truth.
 * @param initial The initial value.
 */
export function source<T>(initial: T): ReactiveSource<T> {
  return getAdapter().source(initial);
}

/**
 * Creates a derived reactive value.
 * @param fn A computation function that depends on other reactive values.
 */
export function derive<T>(fn: () => T): ReactiveValue<T> {
  return getAdapter().derive(fn);
}

/**
 * Executes a function whenever its reactive dependencies change.
 * @param fn The effect function to execute.
 */
export function watch(fn: EffectFn): StopFn {
  return getAdapter().watch(fn);
}

export * from './types';
