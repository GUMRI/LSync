/**
 * A reactive value that can be read by calling it as a function.
 */
export interface ReactiveValue<T> {
  (): T;
}

/**
 * A reactive source that can be updated.
 */
export interface ReactiveSource<T> extends ReactiveValue<T> {
  set(value: T): void;
  update(updater: (prev: T) => T): void;
}

/**
 * A function to stop an effect or watcher.
 */
export type StopFn = () => void;

/**
 * An effect function that may return a cleanup function.
 */
export type EffectFn = () => (void | StopFn);

/**
 * The core adapter interface that each framework must implement.
 */
export interface ReactiveAdapter {
  source<T>(initial: T): ReactiveSource<T>;
  derive<T>(fn: () => T): ReactiveValue<T>;
  watch(fn: EffectFn): StopFn;
}
