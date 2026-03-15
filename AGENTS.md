# AGENTS.md

## Project Overview

jankmeter is an npm package that provides a real-time performance monitoring toolbar for React apps. It monitors FPS, jank %, input delay (INP-style), memory usage, network requests, React render counts, and hydration timing via a single zero-config developer overlay.

## Architecture

- `src/core/` — Core module: collectors, event bus, toolbar renderer, types
- `src/react/` — React component wrapper (`<JankMeter />`)
- `src/vite/` — Vite plugin (auto-injects via `transformIndexHtml`)
- `src/webpack/` — Webpack plugin (injects via `html-webpack-plugin`)
- `src/next/` — Next.js adapter (client-only dynamic import)
- `src/noop.ts` — Production empty module (conditional export default)
- `tests/` — Unit tests (bun test)

## Key Patterns

- **Event Bus**: All collectors push metrics to a typed pub/sub bus. The toolbar subscribes and throttles DOM updates to 500ms.
- **Shadow DOM**: The toolbar renders inside a Shadow DOM to avoid CSS conflicts with the host app.
- **Production Safety**: Three layers — conditional exports in package.json, runtime `NODE_ENV` guard in `init()`, and `sideEffects: false` for tree-shaking.
- **SSR Safety**: All collectors and the toolbar check for browser globals before initializing.
- **Monkey-patching**: Network collector patches `fetch` and `XHR` by chaining through the previous function (not the original) to preserve third-party instrumentation chains (Sentry, MSW, etc.).

## Build & Test

- Runtime/PM: Bun
- Bundler: tsup (ESM + CJS + DTS)
- Tests: `bun test`
- Build: `bun run build`

## Conventions

- All source is TypeScript with strict mode
- No external runtime dependencies — bippy is an optional peer dep loaded via dynamic import
- Collectors follow a consistent pattern: constructor(bus, maxHistory), start(), stop()
- The toolbar uses vanilla DOM (no framework dependency in core)
