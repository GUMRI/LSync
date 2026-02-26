import React from 'react';
import { setAdapter } from '../src/uni-reactive';
import { ReactAdapter, useReactiveValue } from '../src/adapters/reactive/react';
import { createCounter } from './shared-logic';

/**
 * Example: Integration in a React application.
 */

// Step 1: Tell UniReactive to use the React-friendly bridge
setAdapter(ReactAdapter);

// Step 2: Use your framework-agnostic logic
const counter = createCounter(5);

// Step 3: Use it in a React component
// React requires a hook to subscribe to external stores.
// We use the provided useReactiveValue hook.
export function ReactCounterApp() {
  const count = useReactiveValue(counter.count);
  const doubled = useReactiveValue(counter.doubled);

  return (
    <div className="react-app">
      <h1>React Application</h1>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={counter.increment}>Increment</button>
      <button onClick={counter.decrement}>Decrement</button>
    </div>
  );
}
