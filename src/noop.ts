export function init() {}
export function destroy() {}
export function getMetrics() {
  return null;
}

/** No-op component when NODE_ENV=production; allows static import without build errors */
export function JankMeter(_props?: unknown): null {
  return null;
}
