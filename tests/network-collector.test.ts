import { describe, it, expect } from 'bun:test';
import { EventBus } from '../src/core/event-bus';
import { NetworkCollector, sanitizeUrl } from '../src/core/network-collector';

describe('sanitizeUrl', () => {
  it('strips query string and fragment from URLs', () => {
    expect(sanitizeUrl('https://api.example.com/users?token=secret&api_key=sk-xxx')).toBe(
      'https://api.example.com/users'
    );
    expect(sanitizeUrl('https://example.com/path#fragment')).toBe('https://example.com/path');
  });

  it('preserves origin and path', () => {
    expect(sanitizeUrl('https://api.example.com/v1/orders/123')).toBe(
      'https://api.example.com/v1/orders/123'
    );
  });

  it('returns [invalid-url] for unparseable URLs', () => {
    // URL constructor throws for malformed IPv6 (e.g. truncated)
    expect(sanitizeUrl('http://[::')).toBe('[invalid-url]');
  });
});

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
