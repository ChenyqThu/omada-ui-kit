/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              priority: 30,
              test: /node_modules\/(react|react-dom|scheduler)\//,
            },
            {
              name: 'vendor-antd',
              priority: 25,
              test: /node_modules\/(antd|@ant-design|rc-|@rc-component)\//,
            },
            {
              name: 'vendor-echarts',
              priority: 25,
              test: /node_modules\/(echarts|zrender)\//,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
    testTimeout: 15000,
  },
});
