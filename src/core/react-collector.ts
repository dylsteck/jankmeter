import { EventBus } from './event-bus';
import type { ReactMetrics, HydrationMetrics } from './types';

export class ReactCollector {
  private bus: EventBus;
  private commitCount = 0;
  private renderCount = 0;
  private recentRenders: { name: string; duration: number }[] = [];
  private commitDuration = 0;
  private history: number[] = [];
  private maxHistory: number;
  private supported = false;
  private intervalRenderCount = 0;
  private emitTimer: ReturnType<typeof setInterval> | null = null;
  private hydrationDetected = false;
  private hydrationDuration: number | null = null;
  private hydrationTimestamp: number | null = null;
  private cleanup: (() => void) | null = null;

  constructor(bus: EventBus, maxHistory = 60) {
    this.bus = bus;
    this.maxHistory = maxHistory;
  }

  async start(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Try bippy first
    const bippy = await import('bippy').catch(() => null);

    if (bippy && typeof bippy.instrument === 'function') {
      this.startWithBippy(bippy);
    } else {
      this.startWithDevToolsHook();
    }

    // Emit render counts periodically for sparkline
    this.emitTimer = setInterval(() => {
      this.history.push(this.intervalRenderCount);
      if (this.history.length > this.maxHistory) {
        this.history = this.history.slice(-this.maxHistory);
      }
      this.intervalRenderCount = 0;
      this.emit();
    }, 1000);
  }

  stop(): void {
    this.cleanup?.();
    this.cleanup = null;
    if (this.emitTimer !== null) {
      clearInterval(this.emitTimer);
      this.emitTimer = null;
    }
  }

  private startWithBippy(bippy: any): void {
    try {
      const rdtHook = bippy.getRDTHook?.();
      if (!rdtHook) {
        this.startWithDevToolsHook();
        return;
      }

      const secureHook = typeof bippy.secure === 'function' ? bippy.secure(rdtHook) : rdtHook;
      this.supported = true;
      this.checkHydration();

      const unsub = bippy.instrument(secureHook, {
        onCommitFiberRoot: (_rendererID: number, fiberRoot: any) => {
          this.commitCount++;
          this.commitDuration = 0;

          if (typeof bippy.traverseRenderedFibers === 'function') {
            bippy.traverseRenderedFibers(fiberRoot, (fiber: any) => {
              this.renderCount++;
              this.intervalRenderCount++;

              const name = typeof bippy.getDisplayName === 'function'
                ? bippy.getDisplayName(fiber)
                : fiber?.type?.displayName || fiber?.type?.name || 'Unknown';

              let duration = 0;
              if (typeof bippy.getTimings === 'function') {
                const timings = bippy.getTimings(fiber);
                duration = timings?.selfBaseDuration ?? 0;
                this.commitDuration += duration;
              }

              this.recentRenders.push({ name: name || 'Unknown', duration });
              if (this.recentRenders.length > 20) {
                this.recentRenders = this.recentRenders.slice(-20);
              }
            });
          } else {
            this.renderCount++;
            this.intervalRenderCount++;
          }

          this.emit();
        },
      });

      this.cleanup = typeof unsub === 'function' ? unsub : null;
    } catch {
      this.startWithDevToolsHook();
    }
  }

  private startWithDevToolsHook(): void {
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) {
      this.supported = false;
      this.emit();
      return;
    }

    this.supported = true;
    this.checkHydration();

    const origOnCommit = hook.onCommitFiberRoot;
    hook.onCommitFiberRoot = (...args: any[]) => {
      this.commitCount++;
      this.renderCount++;
      this.intervalRenderCount++;
      this.emit();
      if (typeof origOnCommit === 'function') {
        return origOnCommit.apply(hook, args);
      }
    };

    this.cleanup = () => {
      if (origOnCommit) {
        hook.onCommitFiberRoot = origOnCommit;
      }
    };
  }

  private checkHydration(): void {
    const root = document.getElementById('root') || document.getElementById('__next');
    if (root && root.children.length > 0) {
      this.hydrationDetected = true;
      this.hydrationTimestamp = performance.now();
      // Duration is time from navigation start (performance.now() origin) to hydration detection
      this.hydrationDuration = this.hydrationTimestamp;

      this.bus.emit('hydration', {
        detected: true,
        duration: this.hydrationDuration,
        timestamp: this.hydrationTimestamp,
      } satisfies HydrationMetrics);
    }
  }

  private emit(): void {
    this.bus.emit('react', {
      commitCount: this.commitCount,
      renderCount: this.renderCount,
      recentRenders: [...this.recentRenders],
      commitDuration: Math.round(this.commitDuration * 100) / 100,
      supported: this.supported,
      history: [...this.history],
    } satisfies ReactMetrics);
  }

  isSupported(): boolean {
    return this.supported;
  }
}
