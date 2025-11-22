# LSyncEngine

LSyncEngine is a powerful and flexible TypeScript library for synchronizing lists of items between local and remote data stores. It is designed with a layered architecture, leveraging design patterns to ensure extensibility, network efficiency, and robust conflict resolution. This engine is capable of managing multiple distinct data lists simultaneously.

## Features

- **Multi-List Support**: Synchronize multiple independent data lists (e.g., 'tasks', 'notes') using a `listName` identifier.
- **Adapter Pattern**: Easily connect to any local (e.g., IndexedDB) or remote (e.g., Firestore, REST API) data source by implementing the `ILocalSyncAdapter` and `ISyncAdapter` interfaces.
- **Strategy Pattern**: Choose between different sync strategies, such as `BootstrapSyncStrategy` for initial data fetching and `RealtimeSyncStrategy` for live updates.
- **Real-time & Batch Operations**: The architecture is built around `watch` and `mutate` methods, making it ideal for real-time applications and efficient batch processing.
- **Last-Write-Wins (LWW)**: Automatic conflict resolution for item updates based on the `updatedAt` timestamp.
- **Remote-First State Management**: Client online/offline status and deletion records are managed on the remote data store, ensuring a single source of truth and robust offline handling.
- **Remove-Wins Algorithm**: A robust deletion algorithm that ensures deletions are correctly propagated to all clients, even those that are temporarily offline.

## Installation

```bash
npm install lsync-engine
```

## Usage

Here's a basic example of how to set up and use `LSyncEngine`:

```typescript
import {
  LSyncEngine,
  LocalAdapter,
  RemoteAdapter,
  BootstrapSyncStrategy,
  // ... other components
} from 'lsync-engine';

// 1. Implement your custom adapters
class MyLocalAdapter extends LocalAdapter<MyItem> { /* ... */ }
class MyRemoteAdapter extends RemoteAdapter<MyItem> { /* ... */ }

// 2. Instantiate the adapters and choose a strategy
const localAdapter = new MyLocalAdapter();
const remoteAdapter = new MyRemoteAdapter();
const syncStrategy = new BootstrapSyncStrategy(/* ... */);

// 3. Configure and create the engine instance
const engine = new LSyncEngine({
  localAdapter,
  remoteAdapter,
  strategy: syncStrategy,
});

// 4. Start synchronization for a specific list
engine.start('my-tasks-list');

// 5. Mutate data
const operations = new Map();
operations.set('task-1', { type: 'add', item: { id: 'task-1', ... } });
engine.mutate('my-tasks-list', operations);
```

## Architecture

The library is divided into several key components:

- **Adapters**: `LocalAdapter` and `RemoteAdapter` handle the communication with your data stores.
- **Strategies**: `BootstrapSyncStrategy` and `RealtimeSyncStrategy` define the synchronization logic.
- **Core Components**: `ClientProvider`, `CheckpointProvider`, `PendingQueue`, `LwwConflictHandler`, and `RemoveWinsHandler` manage the internal state and logic.
- **LSyncEngine**: The main facade that coordinates all the components.

## Testing

This project uses `vitest` for testing. To run the tests, use:

```bash
npm test
```
