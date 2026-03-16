import { EventBus } from './event-bus';
import type { MemoryMetrics } from './types';

export class MemoryCollector {
  private bus: EventBus;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private history: number[] = [];
  private maxHistory: number;
  private supported = false;

  constructor(bus: EventBus, maxHistory = 60) {
    this.bus = bus;
    this.maxHistory = maxHistory;
  }

  start(): void {
    if (typeof performance === 'undefined') return;
    const perf = performance as any;
    this.supported = !!perf.memory;

    this.poll();
    this.intervalId = setInterval(() => this.poll(), 3000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private poll(): void {
    const perf = performance as any;
    if (!perf.memory) {
      this.bus.emit('memory', {
        usedMB: 0,
        totalMB: 0,
        limitMB: 0,
        formatted: 'N/A',
        supported: false,
        history: [],
      } satisfies MemoryMetrics);
      return;
    }

    const used = perf.memory.usedJSHeapSize;
    const total = perf.memory.totalJSHeapSize;
    const limit = perf.memory.jsHeapSizeLimit;

    const usedMB = Math.round(used / 1024 / 1024);
    const totalMB = Math.round(total / 1024 / 1024);
    const limitMB = Math.round(limit / 1024 / 1024);

    let formatted: string;
    if (usedMB >= 1024) {
      formatted = `${(usedMB / 1024).toFixed(2)}GB`;
    } else {
      formatted = `${usedMB}MB`;
    }

    this.history.push(usedMB);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    this.bus.emit('memory', {
      usedMB,
      totalMB,
      limitMB,
      formatted,
      supported: true,
      history: [...this.history],
    } satisfies MemoryMetrics);
  }

  isSupported(): boolean {
    return this.supported;
  }
}
