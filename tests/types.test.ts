import { describe, it, expect } from 'bun:test';
import { getSeverity } from '../src/core/types';

describe('getSeverity', () => {
  // FPS
  it('fps >= 55 is good', () => {
    expect(getSeverity('fps', 55)).toBe('good');
    expect(getSeverity('fps', 60)).toBe('good');
  });
  it('fps 30-54 is warn', () => {
    expect(getSeverity('fps', 54)).toBe('warn');
    expect(getSeverity('fps', 30)).toBe('warn');
  });
  it('fps < 30 is bad', () => {
    expect(getSeverity('fps', 29)).toBe('bad');
    expect(getSeverity('fps', 0)).toBe('bad');
  });

  // Jank
  it('jank < 5 is good', () => {
    expect(getSeverity('jank', 0)).toBe('good');
    expect(getSeverity('jank', 4)).toBe('good');
  });
  it('jank 5-15 is warn', () => {
    expect(getSeverity('jank', 5)).toBe('warn');
    expect(getSeverity('jank', 15)).toBe('warn');
  });
  it('jank > 15 is bad', () => {
    expect(getSeverity('jank', 16)).toBe('bad');
  });

  // Delay
  it('delay < 100 is good', () => {
    expect(getSeverity('delay', 50)).toBe('good');
    expect(getSeverity('delay', 99)).toBe('good');
  });
  it('delay 100-300 is warn', () => {
    expect(getSeverity('delay', 100)).toBe('warn');
    expect(getSeverity('delay', 300)).toBe('warn');
  });
  it('delay > 300 is bad', () => {
    expect(getSeverity('delay', 301)).toBe('bad');
  });

  // Memory
  it('memory < 200 is good', () => {
    expect(getSeverity('memory', 100)).toBe('good');
  });
  it('memory 200-500 is warn', () => {
    expect(getSeverity('memory', 200)).toBe('warn');
    expect(getSeverity('memory', 500)).toBe('warn');
  });
  it('memory > 500 is bad', () => {
    expect(getSeverity('memory', 501)).toBe('bad');
  });

  // Network
  it('network <= 2 is good', () => {
    expect(getSeverity('network', 0)).toBe('good');
    expect(getSeverity('network', 2)).toBe('good');
  });
  it('network 3-5 is warn', () => {
    expect(getSeverity('network', 3)).toBe('warn');
    expect(getSeverity('network', 5)).toBe('warn');
  });
  it('network > 5 is bad', () => {
    expect(getSeverity('network', 6)).toBe('bad');
  });

  // Hydration Duration
  it('hydrationDuration < 100 is good', () => {
    expect(getSeverity('hydrationDuration', 50)).toBe('good');
  });
  it('hydrationDuration 100-500 is warn', () => {
    expect(getSeverity('hydrationDuration', 100)).toBe('warn');
    expect(getSeverity('hydrationDuration', 500)).toBe('warn');
  });
  it('hydrationDuration > 500 is bad', () => {
    expect(getSeverity('hydrationDuration', 501)).toBe('bad');
  });

  // React — always good
  it('react is always good', () => {
    expect(getSeverity('react', 100)).toBe('good');
    expect(getSeverity('react', 0)).toBe('good');
  });

  // Hydration — always good
  it('hydration is always good', () => {
    expect(getSeverity('hydration', 999)).toBe('good');
  });
});
