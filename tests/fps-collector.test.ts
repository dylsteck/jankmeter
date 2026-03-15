import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { EventBus } from '../src/core/event-bus';
import { FpsCollector } from '../src/core/fps-collector';

describe('FpsCollector', () => {
  it('should construct without errors', () => {
    const bus = new EventBus();
    const collector = new FpsCollector(bus);
    expect(collector).toBeDefined();
  });

  it('should no-op in SSR (no requestAnimationFrame)', () => {
    const originalRAF = globalThis.requestAnimationFrame;
    (globalThis as any).requestAnimationFrame = undefined;

    const bus = new EventBus();
    const collector = new FpsCollector(bus);
    expect(() => collector.start()).not.toThrow();
    collector.stop();

    (globalThis as any).requestAnimationFrame = originalRAF;
  });

  it('should stop cleanly', () => {
    const bus = new EventBus();
    const collector = new FpsCollector(bus);
    expect(() => collector.stop()).not.toThrow();
  });
});
