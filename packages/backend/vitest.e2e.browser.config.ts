import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-utils/setup.ts'],
    // Browser E2E tests config - only include browser E2E test files
    include: ['tests/e2e/**/*-browser.e2e.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30000,
    fileParallelism: false,
  },
});
