import { describe, it, expect } from 'bun:test';
import { EventBus } from '../src/core/event-bus';
import { NetworkCollector } from '../src/core/network-collector';

describe('NetworkCollector', () => {
  it('should construct without errors', () => {
    const bus = new EventBus();
    const collector = new NetworkCollector(bus);
    expect(collector).toBeDefined();
  });

  it('should no-op in SSR (no window)', () => {
    // In bun test, window is not defined, so start() should no-op
    const bus = new EventBus();
    const collector = new NetworkCollector(bus);
    expect(() => collector.start()).not.toThrow();
    collector.stop();
  });

  it('should stop cleanly without starting', () => {
    const bus = new EventBus();
    const collector = new NetworkCollector(bus);
    expect(() => collector.stop()).not.toThrow();
  });
});
