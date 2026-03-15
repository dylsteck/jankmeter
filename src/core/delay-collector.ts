import { EventBus } from './event-bus';
import type { DelayMetrics } from './types';

export class DelayCollector {
  private bus: EventBus;
  private observer: PerformanceObserver | null = null;
  private delays: number[] = [];
  private history: number[] = [];
  private maxHistory: number;
  private supported = false;

  constructor(bus: EventBus, maxHistory = 60) {
    this.bus = bus;
    this.maxHistory = maxHistory;
  }

  start(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const e = entry as any;
          if (e.processingStart && e.startTime) {
            const delay = e.processingStart - e.startTime;
            if (delay >= 0) {
              this.delays.push(delay);
              // Keep bounded
              if (this.delays.length > 500) {
                this.delays = this.delays.slice(-500);
              }
              this.emitMetrics(delay);
            }
          }
        }
      });
      this.observer.observe({ type: 'event', buffered: true } as any);
      this.supported = true;
    } catch {
      this.supported = false;
    }
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private emitMetrics(lastDelay: number): void {
    const sorted = [...this.delays].sort((a, b) => a - b);
    const p98Index = Math.floor(sorted.length * 0.98);
    const p98Delay = sorted[Math.min(p98Index, sorted.length - 1)];
    const maxDelay = sorted[sorted.length - 1];

    const roundedDelay = Math.round(lastDelay);
    this.history.push(roundedDelay);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    const metrics: DelayMetrics = {
      lastDelay: roundedDelay,
      maxDelay: Math.round(maxDelay),
      p98Delay: Math.round(p98Delay),
      history: [...this.history],
    };

    this.bus.emit('delay', metrics);
  }

  isSupported(): boolean {
    return this.supported;
  }
}
