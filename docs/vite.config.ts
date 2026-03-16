import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxImportSource: 'preact',
  },
  resolve: {
    alias: {
      jankmeter: path.resolve(__dirname, '../dist/index.js'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  build: {
    outDir: 'dist',
  },
});
