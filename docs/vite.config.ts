import { defineConfig } from 'vite';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));

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
    '__JANKMETER_VERSION__': JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist',
  },
});
