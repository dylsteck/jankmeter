import { EventBus } from './event-bus';
import type { NetworkMetrics, NetworkRequest } from './types';

declare const __jankMeterPatched: unique symbol;

/** Strip query string and fragment to avoid leaking tokens/keys in URLs. Exported for testing. */
export function sanitizeUrl(url: string): string {
  try {
    const base = typeof location !== 'undefined' ? location.origin : 'https://_';
    const u = new URL(url, base);
    return u.origin + u.pathname;
  } catch {
    return '[invalid-url]';
  }
}

export class NetworkCollector {
  private bus: EventBus;
  private inFlight = 0;
  private requests: NetworkRequest[] = [];
  private history: number[] = [];
  private maxHistory: number;
  private maxRequests = 50;
  private observer: PerformanceObserver | null = null;
  private originalFetch: typeof fetch | null = null;
  private originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
  private originalXhrSend: typeof XMLHttpRequest.prototype.send | null = null;
  private emitTimer: ReturnType<typeof setInterval> | null = null;

  constructor(bus: EventBus, maxHistory = 60) {
    this.bus = bus;
    this.maxHistory = maxHistory;
  }

  start(): void {
    if (typeof window === 'undefined') return;

    this.patchFetch();
    this.patchXHR();
    this.observeResources();

    // Periodic history emit
    this.emitTimer = setInterval(() => {
      this.history.push(this.inFlight);
      if (this.history.length > this.maxHistory) {
        this.history = this.history.slice(-this.maxHistory);
      }
      this.emit();
    }, 1000);
  }

  stop(): void {
    this.restoreFetch();
    this.restoreXHR();
    this.observer?.disconnect();
    this.observer = null;
    if (this.emitTimer !== null) {
      clearInterval(this.emitTimer);
      this.emitTimer = null;
    }
  }

  private patchFetch(): void {
    if (typeof window.fetch === 'undefined') return;
    if ((window.fetch as any).__jankMeterPatched) return;

    // Save reference to current fetch (preserves Sentry/MSW chain)
    const prevFetch = window.fetch;
    this.originalFetch = prevFetch;

    const self = this;
    const patchedFetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
      const startTime = performance.now();

      self.inFlight++;
      self.emit();

      const req: NetworkRequest = { url: sanitizeUrl(url), method, startTime };
      self.addRequest(req);

      return prevFetch.call(window, input, init).then(
        (response) => {
          self.inFlight = Math.max(0, self.inFlight - 1);
          req.endTime = performance.now();
          req.status = response.status;
          self.emit();
          return response;
        },
        (error) => {
          self.inFlight = Math.max(0, self.inFlight - 1);
          req.endTime = performance.now();
          req.status = 0;
          self.emit();
          throw error;
        }
      );
    } as typeof fetch;

    (patchedFetch as any).__jankMeterPatched = true;
    window.fetch = patchedFetch;
  }

  private restoreFetch(): void {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
  }

  private patchXHR(): void {
    if (typeof XMLHttpRequest === 'undefined') return;
    if ((XMLHttpRequest.prototype.open as any).__jankMeterPatched) return;

    this.originalXhrOpen = XMLHttpRequest.prototype.open;
    this.originalXhrSend = XMLHttpRequest.prototype.send;

    const self = this;
    const origOpen = this.originalXhrOpen;
    const origSend = this.originalXhrSend;

    (XMLHttpRequest.prototype as any).open = function (method: string, url: string | URL, ...args: any[]) {
      (this as any).__jmMethod = method;
      (this as any).__jmUrl = typeof url === 'string' ? url : url.toString();
      return origOpen.apply(this, [method, url, ...args] as any);
    };
    ((XMLHttpRequest.prototype as any).open as any).__jankMeterPatched = true;

    XMLHttpRequest.prototype.send = function (...args: any[]) {
      const startTime = performance.now();
      self.inFlight++;
      self.emit();

      const req: NetworkRequest = {
        url: sanitizeUrl((this as any).__jmUrl ?? ''),
        method: (this as any).__jmMethod ?? 'GET',
        startTime,
      };
      self.addRequest(req);

      const done = () => {
        self.inFlight = Math.max(0, self.inFlight - 1);
        req.endTime = performance.now();
        req.status = this.status;
        self.emit();
      };

      this.addEventListener('load', done, { once: true });
      this.addEventListener('error', done, { once: true });
      this.addEventListener('abort', done, { once: true });

      return origSend.apply(this, args as any);
    };
  }

  private restoreXHR(): void {
    if (this.originalXhrOpen) {
      XMLHttpRequest.prototype.open = this.originalXhrOpen as any;
      this.originalXhrOpen = null;
    }
    if (this.originalXhrSend) {
      XMLHttpRequest.prototype.send = this.originalXhrSend;
      this.originalXhrSend = null;
    }
  }

  private observeResources(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const res = entry as PerformanceResourceTiming;
          this.addRequest({
            url: sanitizeUrl(res.name),
            method: 'GET',
            startTime: res.startTime,
            endTime: res.startTime + res.duration,
            size: res.transferSize,
          });
        }
      });
      this.observer.observe({ type: 'resource', buffered: false });
    } catch {}
  }

  private addRequest(req: NetworkRequest): void {
    this.requests.push(req);
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(-this.maxRequests);
    }
  }

  private emit(): void {
    this.bus.emit('network', {
      inFlight: this.inFlight,
      recentRequests: [...this.requests],
      history: [...this.history],
    } satisfies NetworkMetrics);
  }
}
