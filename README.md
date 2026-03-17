# jankmeter

Real-time performance monitoring toolbar for React apps. FPS, jank %, input delay, memory, network, React renders, and hydration timing — all in one zero-config overlay. Inspired by [Linear's developer toolbar](https://x.com/karrisaarinen/status/2025002840683675725) and built by [dylsteck](https://github.com/dylsteck).

## Demo

https://github.com/user-attachments/assets/f3f2d6c2-c7b6-489d-b869-9a07f978f4c9

## Quick Start

### React Component (recommended)

```tsx
// App.tsx or layout.tsx
import { JankMeter } from 'jankmeter/react';

export default function App() {
  return (
    <>
      <JankMeter />
      {/* your app */}
    </>
  );
}
```

### Vite Plugin

```ts
// vite.config.ts
import { jankMeter } from 'jankmeter/vite';

export default {
  plugins: [jankMeter()],
};
```

For callbacks like `onMetrics`, use `init()` directly; the plugin only supports serializable config.

### Next.js (App Router)

```tsx
// app/layout.tsx
import { JankMeter } from 'jankmeter/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <JankMeter />
        {children}
      </body>
    </html>
  );
}
```

### Script

```ts
import { init, destroy, getMetrics } from 'jankmeter';

init({
  onMetrics: (m) => console.log(m),
});

// Later: destroy();
```

## Metrics

| Metric | Source | Browsers |
|--------|--------|----------|
| **FPS** | `requestAnimationFrame` rolling window | All |
| **Jank %** | Dropped frames / expected frames | All |
| **Delay** | Event Timing API (INP-style) | Chrome 96+ |
| **Memory** | `performance.memory` | Chrome only |
| **Network** | fetch/XHR instrumentation + PerformanceObserver | All |
| **React** | [bippy](https://github.com/aidenybai/bippy) + DevTools hook | All (with React) |
| **Hydration** | First commit timing | All (with SSR) |

## Configuration

```ts
interface JankMeterConfig {
  enabled?: boolean;        // default: true
  shortcut?: string;        // default: 'Ctrl+Shift+M' — supports 'F2', 'Ctrl+Shift+K', etc.
  throttleMs?: number;      // DOM update interval, default: 500
  maxHistory?: number;      // sparkline data points, default: 60
  onMetrics?: (metrics: AllMetrics) => void;
}
```

## Features

- **Zero config** — drop in and go
- **Shadow DOM** — styles never leak into your app
- **Auto-calibrates** — detects 60/90/120/144Hz displays
- **Keyboard shortcut** — `Ctrl+Shift+M` by default, configurable (e.g. `F2`, `Ctrl+Shift+K`)
- **Minimize to dot** — severity-colored indicator
- **Download** — export metrics as JSON
- **Production safe** — three layers of tree-shaking (conditional exports, runtime guard, `sideEffects: false`)
- **SSR safe** — no-ops on the server

## Webpack Plugin

```ts
// webpack.config.js
const { JankMeterWebpackPlugin } = require('jankmeter/webpack');

module.exports = {
  plugins: [new JankMeterWebpackPlugin()],
};
```

Requires `html-webpack-plugin`. Dev mode only — automatically disabled in production builds. For callbacks like `onMetrics`, use `init()` directly; the plugin only supports serializable config.

## Programmatic API

```ts
import { getMetrics } from 'jankmeter';

const snapshot = getMetrics();
// { fps, delay, memory, network, react, hydration }
```

## Browser Support

| Browser | FPS | Delay | Memory | Network | React |
|---------|-----|-------|--------|---------|-------|
| Chrome 96+ | Full | Full | Full | Full | Full |
| Firefox | Full | N/A | N/A | Full | Full |
| Safari | Full | N/A | N/A | Full | Full |
| Edge | Full | Full | Full | Full | Full |

## License

[MIT](LICENSE.md)
