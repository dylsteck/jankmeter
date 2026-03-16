import { describe, it, expect } from 'bun:test';
import { EventBus } from '../src/core/event-bus';

describe('EventBus', () => {
  it('should subscribe and receive events', () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.on('test', (msg: string) => received.push(msg));
    bus.emit('test', 'hello');
    expect(received).toEqual(['hello']);
  });

  it('should support multiple listeners', () => {
    const bus = new EventBus();
    let count = 0;
    bus.on('inc', () => count++);
    bus.on('inc', () => count++);
    bus.emit('inc');
    expect(count).toBe(2);
  });

  it('should unsubscribe via returned function', () => {
    const bus = new EventBus();
    let count = 0;
    const unsub = bus.on('test', () => count++);
    bus.emit('test');
    unsub();
    bus.emit('test');
    expect(count).toBe(1);
  });

  it('should unsubscribe via off()', () => {
    const bus = new EventBus();
    let count = 0;
    const cb = () => count++;
    bus.on('test', cb);
    bus.emit('test');
    bus.off('test', cb);
    bus.emit('test');
    expect(count).toBe(1);
  });

  it('should not throw when emitting with no listeners', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nope')).not.toThrow();
  });

  it('should clear all listeners on destroy', () => {
    const bus = new EventBus();
    let count = 0;
    bus.on('a', () => count++);
    bus.on('b', () => count++);
    bus.destroy();
    bus.emit('a');
    bus.emit('b');
    expect(count).toBe(0);
  });
});
