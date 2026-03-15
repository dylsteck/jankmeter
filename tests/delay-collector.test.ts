import { describe, it, expect } from 'bun:test';
import { EventBus } from '../src/core/event-bus';
import { DelayCollector } from '../src/core/delay-collector';

describe('DelayCollector', () => {
  it('should construct without errors', () => {
    const bus = new EventBus();
    const collector = new DelayCollector(bus);
    expect(collector).toBeDefined();
  });

  it('should handle missing PerformanceObserver gracefully', () => {
    const originalPO = globalThis.PerformanceObserver;
    (globalThis as any).PerformanceObserver = undefined;

    const bus = new EventBus();
    const collector = new DelayCollector(bus);
    expect(() => collector.start()).not.toThrow();
    expect(collector.isSupported()).toBe(false);
    collector.stop();

    (globalThis as any).PerformanceObserver = originalPO;
  });

  it('should stop cleanly', () => {
    const bus = new EventBus();
    const collector = new DelayCollector(bus);
    expect(() => collector.stop()).not.toThrow();
  });
});
