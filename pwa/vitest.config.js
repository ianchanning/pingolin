import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // THE NUKE: Blind Vite. Tell it there is no public directory during tests.
  // This bypasses the "Cannot import non-asset file... inside /public" error entirely.
  publicDir: false,

  test: {
    environment: 'node',
  },
  resolve: {
    // Upgrading to the Array/Regex syntax for absolute, undeniable interception
    alias: [
      {
        // The regex ensures it catches the exact string, ignoring leading slashes or base URL weirdness
        find: /^\/vendor\/sqlite3-bundler-friendly\.mjs$/,
        replacement: fileURLToPath(
          new URL('./tests/__mocks__/sqlite-mock.js', import.meta.url)
        ),
      },
    ],
  },
});
