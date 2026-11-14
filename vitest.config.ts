import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  // Next's tsconfig uses `jsx: preserve`; tests still need to compile the resume data's icon components.
  esbuild: { jsx: 'automatic' },
  test: { environment: 'node', include: ['features/**/*.test.ts'] },
});
