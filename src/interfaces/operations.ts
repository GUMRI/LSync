import { BaseItem } from './base-item';

/**
 * Defines the type of a mutation operation.
 */
export type OperationType = 'add' | 'update' | 'delete';

/**
 * Represents a single operation in a mutation request.
 * For 'add' and 'update', the full item is required.
 * For 'delete', only the item's 'id' is needed.
 */
export type Operation<T extends BaseItem> = {
  type: OperationType;
  item: T | { id: string };
};

/**
 * A map of item IDs to their corresponding mutation operations.
 */
export type OperationsMap<T extends BaseItem> = Map<string, Operation<T>>;

/**
 * A callback function for watchers, which receives the data array or an error.
 */
export type WatchCallback<T> = (data: T[], error?: Error) => void;

/**
 * A function that, when called, unsubscribes from a watcher.
 */
export type Unsubscribe = () => void;
