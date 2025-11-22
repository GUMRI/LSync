# LSyncEngine

LSyncEngine is a powerful and flexible library for synchronizing lists of items between local and remote data stores. It is designed with a layered architecture, leveraging design patterns to ensure extensibility, network efficiency, and robust conflict resolution.

## Features

- **Adapter Pattern**: Easily connect to any local (e.g., IndexedDB) or remote (e.g., Firestore, REST API) data source by implementing the `ISyncAdapter` interface.
- **Strategy Pattern**: Choose between different sync strategies, such as `BootstrapSyncStrategy` for periodic syncing and `RealtimeSyncStrategy` for live updates.
- **Last-Write-Wins (LWW)**: Automatic conflict resolution for item updates based on the `updatedAt` timestamp.
- **Remove-Wins Algorithm**: A robust deletion algorithm that ensures deletions are correctly propagated, even to offline clients.
- **Network Efficiency**: Optimized data fetching using checkpoints and support for grouped queries to minimize network requests.
- **Offline Support**: Queues local changes and syncs them once the client is back online.

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

// 2. Instantiate the components
const localAdapter = new MyLocalAdapter();
const remoteAdapter = new MyRemoteAdapter();
const conflictHandler = new LwwConflictHandler<MyItem>();
const pendingQueue = new PendingQueue<MyItem>();
// ... instantiate other core components

const syncStrategy = new BootstrapSyncStrategy(/* ... */);

// 3. Configure and start the engine
const engine = new LSyncEngine({
  localAdapter,
  remoteAdapter,
  strategy: syncStrategy,
  // ... other components
});

engine.start();
```

## Architecture

The library is divided into several key components:

- **Adapters**: `LocalAdapter` and `RemoteAdapter` handle the communication with your data stores.
- **Strategies**: `BootstrapSyncStrategy` and `RealtimeSyncStrategy` define the synchronization logic.
- **Core Components**:
  - `ClientProvider`: Manages the client's identity.
  - `CheckpointProvider`: Manages the sync checkpoint.
  - `PendingQueue`: Holds pending local changes.
  - `LwwConflictHandler`: Resolves update conflicts.
  - `RemoveWinsHandler`: Manages the Remove-Wins deletion algorithm.
- **LSyncEngine**: The main facade that coordinates all the components.

## Testing

This project uses `vitest` for testing. To run the tests, use:

```bash
npm test
```
