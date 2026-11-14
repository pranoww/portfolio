// Unit test setup: jsdom environment, React plugin and the @/ path alias
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: { globals: true, environment: 'jsdom', setupFiles: ['./tests/setupTests.js'], include: ['tests/unit/**/*.test.{js,jsx}'] },
});
