// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Polyfill Node.js global variables
      global: 'global',
      process: 'process/browser',
      Buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
});
