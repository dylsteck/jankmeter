# jankmeter

Real-time performance monitoring toolbar for React apps. FPS, jank %, input delay, memory, network, React renders, and hydration timing — all in one zero-config overlay.

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
| **React** | [bippy](https://github.com/nicholasgasior/bippy) + DevTools hook | All (with React) |
| **Hydration** | First commit timing | All (with SSR) |

## Configuration

```ts
interface JankMeterConfig {
  enabled?: boolean;        // default: true
  shortcut?: string;        // default: 'Ctrl+Shift+M'
  throttleMs?: number;      // DOM update interval, default: 500
  maxHistory?: number;      // sparkline data points, default: 60
  onMetrics?: (metrics: AllMetrics) => void;
}
```

## Features

- **Zero config** — drop in and go
- **Shadow DOM** — styles never leak into your app
- **Auto-calibrates** — detects 60/90/120/144Hz displays
- **Keyboard shortcut** — `Ctrl+Shift+M` (or `Cmd+Shift+M`) to toggle
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

Requires `html-webpack-plugin`. Dev mode only — automatically disabled in production builds.

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

## Inspired By

The concept was inspired by [Karri Saarinen](https://x.com/karrisaarinen) (Linear CEO) sharing Linear's internal developer toolbar with a jank meter.

## License

MIT
