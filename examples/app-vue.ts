import { setAdapter } from '../src/uni-reactive';
import { VueAdapter } from '../src/adapters/reactive/vue';
import { createCounter } from './shared-logic';
import { defineComponent, h } from 'vue';

/**
 * Example: Integration in a Vue 3 application.
 */

// Step 1: Tell UniReactive to use Vue's native reactive engine
setAdapter(VueAdapter);

// Step 2: Use your framework-agnostic logic
const counter = createCounter(10);

// Step 3: Use it in a Vue component
// Because VueAdapter uses 'ref' and 'watchEffect' internally,
// calling counter.count() inside setup/render will automatically track it.
export const VueCounterApp = defineComponent({
  name: 'VueCounterApp',
  setup() {
    return () => h('div', { class: 'vue-app' }, [
      h('h1', 'Vue Application'),
      h('p', `Count: ${counter.count()}`),
      h('p', `Doubled: ${counter.doubled()}`),
      h('button', { onClick: counter.increment }, 'Increment'),
      h('button', { onClick: counter.decrement }, 'Decrement'),
    ]);
  }
});
