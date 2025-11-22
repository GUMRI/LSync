/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'LSyncEngine',
      fileName: 'lsync-engine',
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});