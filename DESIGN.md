# UniReactive: Cross-Framework Reactive Library Design

## 🏗️ Architecture Overview

UniReactive follows the **Adapter Pattern** to provide a unified interface for reactivity across different JavaScript frameworks.

### 1. Core Layer (`src/core`)
- **Neutral API**: Provides `source`, `derive`, and `watch` functions.
- **Adapter Registry**: A global registry that holds the active `ReactiveAdapter`.
- **Framework Agnostic**: The core has zero dependencies on any framework.

### 2. Adapter Layer (`src/adapters`)
- **Framework Bridges**: Individual implementations for React, Vue, Angular, Solid, and Vanilla.
- **Native Integration**: Each adapter uses the framework's native primitives (e.g., Vue's `ref`, Angular's `signal`).

### 3. Application/Library Layer
- **Shared Logic**: Developers write business logic once using the Core API.
- **Framework Integration**: Apps choose their adapter at the entry point.

---

## 🛠️ Unified API Design

- `source<T>(initial: T)`: Creates a mutable state.
- `derive<T>(fn: () => T)`: Creates a computed/derived value.
- `watch(fn: EffectFn)`: Creates a side-effect (watcher).

---

## 🚀 Adding a New Framework

To add support for a new framework (e.g., *Svelte*):

1. **Implement the `ReactiveAdapter` interface**:
   ```typescript
   export const SvelteAdapter: ReactiveAdapter = {
     source: (init) => { /* use svelte/store writable */ },
     derive: (fn) => { /* use svelte/store derived */ },
     watch: (fn) => { /* use svelte/store subscribe */ }
   };
   ```
2. **Handle the "Getter" function**: Ensure the returned value is a function that returns the current value.
3. **Handle Cleanup**: Ensure the `watch` function returns a `StopFn`.

---

## 🧠 Challenges & Solutions

### 1. The React "Pull" vs. "Push" Challenge
**Challenge**: React components don't re-render automatically when an external variable changes unless it's hooked into React's state.
**Solution**: We provide a `useReactiveValue` hook that uses `useSyncExternalStore`. This bridges the fine-grained reactivity of UniReactive with React's component lifecycle.

### 2. Angular Injection Context
**Challenge**: Angular's `effect()` must be run in an injection context.
**Solution**: The `AngularAdapter` expects the caller to be in an injection context or handles the manual disposal of `EffectRef`.

### 3. Tree-Shaking
**Challenge**: Users don't want to include Vue code in a React app.
**Solution**: Adapters are exported separately. Only the adapter you import and pass to `setAdapter()` will be included in your bundle.

---

## 💡 Usage Strategy

### For Library Authors
Build your library's internal state using `source` and `derive`. Export your reactive variables as `ReactiveValue` or `ReactiveSource`.

### For App Developers
Initialize UniReactive at the start of your app:
```typescript
import { setAdapter } from 'uni-reactive';
import { VueAdapter } from 'uni-reactive/vue';

setAdapter(VueAdapter);
```
Then use any library built with UniReactive directly in your components!
