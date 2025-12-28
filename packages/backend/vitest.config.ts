import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test-utils/**',
      ],
    },
    testTimeout: 30000,
    // Force sequential test file execution to prevent E2E tests
    // from conflicting with unit tests that may touch the database
    fileParallelism: false,
  },
});
