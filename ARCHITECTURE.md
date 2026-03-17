# Architecture

This document explains the jankmeter architecture at a high level.

If `README.md` answers "what is this product and how do I use it?", this file answers "what are the major moving parts and how do they fit together?"

## One-line view

jankmeter is an npm package that runs five browser collectors (FPS, delay, memory, network, React) which push metrics to a typed event bus, and a Shadow DOM toolbar subscribes to that bus and renders a real-time overlay — with conditional exports so production builds resolve to an empty noop module.

## System shape

```text
+------------------+     +------------------+     +------------------+
|  FpsCollector    |     |  DelayCollector  |     | MemoryCollector  |
|  NetworkCollector|     |  ReactCollector  |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                       |                       |
         |  emit(metrics)        |  emit(metrics)        |
         +-----------------------|-----------------------+
                                 |
                                 v
                    +------------------------+
                    |  EventBus (pub/sub)    |
                    +------------+-----------+
                                 |
                                 |  subscribe, throttle 500ms
                                 v
                    +------------------------+
                    |  Toolbar (Shadow DOM)   |
                    |  sparklines, values     |
                    +------------------------+
```

## Design goals reflected in the code

The current architecture optimizes for a few specific ideas:

- **zero-config** — Single `init()` or `<JankMeter />`; no extra setup
- **production-safe** — Conditional exports in package.json point to noop in production; runtime `NODE_ENV` guard; `sideEffects: false` for tree-shaking
- **SSR-safe** — All collectors and the toolbar check for `window` and `document` before initializing
- **framework-agnostic core** — `src/core/` uses vanilla DOM; React/Next/Webpack/Vite are thin adapters
- **no CSS conflicts** — Toolbar renders inside Shadow DOM with isolated styles

## Major components

### `src/core/`: Core module

This is the heart of the system.

Responsibilities:

- **EventBus** — Typed pub/sub; collectors emit events, toolbar subscribes
- **Collectors** — FpsCollector, DelayCollector, MemoryCollector, NetworkCollector, ReactCollector; each has `constructor(bus, maxHistory)`, `start()`, `stop()`
- **Toolbar** — `createHost()` (Shadow DOM), `renderSparkline()`, `renderBarChart()`; subscribes to bus, throttles DOM updates to 500ms
- **Types** — `JankMeterConfig`, `AllMetrics`, `getSeverity()`

### `src/react/`: React component wrapper

Thin wrapper that calls `init()` on mount and `destroy()` on unmount.

### `src/vite/`: Vite plugin

Injects via `transformIndexHtml`; no core bundling.

### `src/webpack/`: Webpack plugin

Injects via `html-webpack-plugin`; no core bundling.

### `src/next/`: Next.js adapter

Client-only dynamic import of core; no SSR execution.

### `src/noop.ts`: Production empty module

Exports `init`, `destroy`, `getMetrics` as no-ops. Resolved when `default` export is used (production).

## Collector lifecycle

1. **init** — `init(config)` creates EventBus, instantiates all five collectors, calls `start()` on each, mounts Toolbar, registers keyboard shortcut.

2. **Running** — Collectors emit `metrics` events to the bus. Toolbar subscribes and throttles updates.

3. **destroy** — `destroy()` stops all collectors, destroys toolbar, clears bus, removes listeners.

## Event flow

1. **Collector → Bus** — Each collector calls `bus.emit('metrics', payload)` when it has new data.

2. **Bus → Toolbar** — Toolbar subscribes via `bus.on('metrics', cb)`. The callback updates internal state and schedules a throttled DOM update (500ms default).

3. **Throttling** — Toolbar uses `lastUpdate` and `throttleMs` to avoid updating the DOM on every event.

## Build pipeline

1. **tsup** — Builds 6 entry points × 2 formats (ESM + CJS) = 12 JS files + DTS. Minification enabled.

2. **add-use-client.mjs** — Post-build script prepends `"use client"` to React and Next outputs for RSC compatibility.

3. **Conditional exports** — `development` condition points to full bundles; `default` points to noop. Production builds never load the full module.

```text
tsup (minify)  -->  add-use-client.mjs  -->  dist/
```

## Why the architecture is shaped this way

The system is trying to solve a specific product problem:

- give developers a single overlay to monitor FPS, jank, delay, memory, network, React, and hydration
- keep the package small and production-safe (no runtime cost in prod)
- support multiple frameworks (React, Next, Vite, Webpack) with minimal adapter code
- avoid CSS conflicts with the host app (Shadow DOM)

That is why the architecture keeps converging on the same central idea:

jankmeter is not just a toolbar. It is a collector pipeline that owns metric gathering, event flow, and rendering — with the host app as a thin integration layer (one import or one component).

## Current boundaries

A few practical boundaries are worth calling out:

- the active implementation is browser-only (no Node.js runtime)
- bippy is an optional peer dep for React metrics; dynamically imported, fallback when absent
- no external runtime dependencies in core; bippy is the only optional dep
- the toolbar uses vanilla DOM; no React or other framework in core
- network collector patches `fetch` and `XHR` by chaining through the previous function (preserves Sentry, MSW, etc.)

## Read next

- `README.md` for the product view and usage guidance
- `AGENTS.md` for agent-specific context, file layout, and conventions
- `src/core/index.ts` for the init/destroy flow
- `src/core/event-bus.ts` for the pub/sub implementation
- `src/core/toolbar.ts` for the toolbar and Shadow DOM setup
