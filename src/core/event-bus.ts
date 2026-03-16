type Callback = (...args: any[]) => void;

export class EventBus {
  private listeners = new Map<string, Set<Callback>>();

  on(event: string, cb: Callback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
    return () => this.off(event, cb);
  }

  off(event: string, cb: Callback): void {
    this.listeners.get(event)?.delete(cb);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  destroy(): void {
    this.listeners.clear();
  }
}
