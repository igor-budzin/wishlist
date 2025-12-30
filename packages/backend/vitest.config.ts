import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-utils/setup.ts'],
    // Exclude E2E tests by default (run them separately with specific test commands)
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test-utils/**',
        '**/e2e/**',
      ],
    },
    testTimeout: 30000,
    // Force sequential test file execution to prevent E2E tests
    // from conflicting with unit tests that may touch the database
    fileParallelism: false,
  },
});
