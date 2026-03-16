import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/core/index.ts',
    noop: 'src/noop.ts',
    'react/index': 'src/react/index.tsx',
    'vite/index': 'src/vite/index.ts',
    'webpack/index': 'src/webpack/index.ts',
    'next/index': 'src/next/index.tsx',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  clean: true,
  external: ['react', 'react-dom', 'bippy', 'vite', 'webpack', 'next', 'next/dynamic'],
  treeshake: true,
});
