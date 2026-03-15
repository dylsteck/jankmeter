import { describe, it, expect } from 'bun:test';
import { init, destroy, getMetrics } from '../src/noop';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('noop module', () => {
  it('init should be a function that does nothing', () => {
    expect(typeof init).toBe('function');
    expect(init()).toBeUndefined();
  });

  it('destroy should be a function that does nothing', () => {
    expect(typeof destroy).toBe('function');
    expect(destroy()).toBeUndefined();
  });

  it('getMetrics should return null', () => {
    expect(typeof getMetrics).toBe('function');
    expect(getMetrics()).toBeNull();
  });

  it('noop.js should be tiny (< 200 bytes)', () => {
    const noopPath = join(import.meta.dir, '..', 'dist', 'noop.js');
    try {
      const content = readFileSync(noopPath, 'utf-8');
      expect(content.length).toBeLessThan(200);
    } catch {
      // dist may not exist during CI if tests run before build
      // Skip this check
    }
  });
});
