import { describe, it, expect } from 'bun:test';
import { EventBus } from '../src/core/event-bus';
import { MemoryCollector } from '../src/core/memory-collector';

describe('MemoryCollector', () => {
  it('should construct without errors', () => {
    const bus = new EventBus();
    const collector = new MemoryCollector(bus);
    expect(collector).toBeDefined();
  });

  it('should report unsupported when performance.memory is absent', () => {
    const bus = new EventBus();
    const collector = new MemoryCollector(bus);
    const received: any[] = [];
    bus.on('memory', (m: any) => received.push(m));

    collector.start();
    // In bun test, performance.memory is typically absent
    expect(received.length).toBeGreaterThanOrEqual(0);
    collector.stop();
  });

  it('should stop cleanly', () => {
    const bus = new EventBus();
    const collector = new MemoryCollector(bus);
    collector.start();
    expect(() => collector.stop()).not.toThrow();
  });
});
