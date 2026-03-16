import { describe, it, expect, beforeEach } from 'bun:test';
import { init, destroy, getMetrics } from '../src/core/index';

describe('Integration (SSR-like environment)', () => {
  beforeEach(() => {
    // Ensure clean state between tests
    destroy();
  });

  it('getMetrics returns null before init', () => {
    expect(getMetrics()).toBeNull();
  });

  it('init does not throw in bun (no DOM)', () => {
    expect(() => init()).not.toThrow();
  });

  it('destroy before init does not throw', () => {
    expect(() => destroy()).not.toThrow();
  });

  it('double init is idempotent (no throw)', () => {
    expect(() => {
      init();
      init();
    }).not.toThrow();
  });

  it('init with enabled: false does nothing', () => {
    init({ enabled: false });
    expect(getMetrics()).toBeNull();
  });

  it('destroy after init does not throw', () => {
    init();
    expect(() => destroy()).not.toThrow();
  });
});
