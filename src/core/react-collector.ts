import { EventBus } from './event-bus';
import type { ReactMetrics, HydrationMetrics } from './types';

/**
 * Minimal interface for the React DevTools global hook when patching directly
 * (fallback path when bippy is not available).
 */
interface ReactDevToolsHook {
  onCommitFiberRoot?: (
    rendererID: number,
    root: unknown,
    priority?: number
  ) => void;
}

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook;
  }
}

/**
 * Shape of the dynamically imported bippy module.
 * Uses types compatible with bippy's exports (Fiber, FiberRoot, etc.)
 */
interface BippyModule {
  instrument: (options: BippyInstrumentationOptions) => unknown;
  secure?: (
    options: BippyInstrumentationOptions,
    secureOptions?: object
  ) => BippyInstrumentationOptions;
  getRDTHook?: (onActive?: () => unknown) => unknown;
  traverseRenderedFibers?: (
    root: BippyFiberRoot,
    onRender: BippyRenderHandler
  ) => void;
  getDisplayName?: (type: unknown) => string | null;
  getTimings?: (fiber?: BippyFiber | null) => {
    selfTime: number;
    totalTime: number;
  };
}

/** Fiber root from bippy (has current fiber) */
interface BippyFiberRoot {
  current?: BippyFiber | null;
}

/** Fiber node from bippy */
interface BippyFiber {
  type?: unknown;
  alternate?: BippyFiber | null;
  child?: BippyFiber | null;
  sibling?: BippyFiber | null;
  actualDuration?: number;
  actualStartTime?: number;
}

/** Render handler for traverseRenderedFibers: (fiber, phase) => void */
type BippyRenderHandler = (
  fiber: BippyFiber,
  phase: 'mount' | 'unmount' | 'update',
  state?: unknown
) => unknown;

/** Instrumentation options for bippy.instrument() */
interface BippyInstrumentationOptions {
  onCommitFiberRoot?: (
    rendererID: number,
    root: BippyFiberRoot,
    priority?: number
  ) => unknown;
}

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
    const bippy = await import('bippy').catch(() => null) as BippyModule | null;

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

  private startWithBippy(bippy: BippyModule): void {
    try {
      const rdtHook = bippy.getRDTHook?.();
      if (!rdtHook) {
        this.startWithDevToolsHook();
        return;
      }

      const options: BippyInstrumentationOptions = {
        onCommitFiberRoot: (
          _rendererID: number,
          fiberRoot: BippyFiberRoot
        ) => {
          this.commitCount++;
          this.commitDuration = 0;

          if (typeof bippy.traverseRenderedFibers === 'function') {
            try {
              bippy.traverseRenderedFibers(fiberRoot, (fiber: BippyFiber) => {
                this.renderCount++;
                this.intervalRenderCount++;

                const name =
                  typeof bippy.getDisplayName === 'function'
                    ? bippy.getDisplayName(fiber.type ?? fiber) ?? 'Unknown'
                    : this.getFiberDisplayName(fiber);

                let duration = 0;
                if (typeof bippy.getTimings === 'function') {
                  const timings = bippy.getTimings(fiber);
                  duration = timings?.selfTime ?? 0;
                  this.commitDuration += duration;
                }

                this.recentRenders.push({ name, duration });
                if (this.recentRenders.length > 20) {
                  this.recentRenders = this.recentRenders.slice(-20);
                }
              });
            } catch {
              // traverseRenderedFibers can stack overflow on deep trees (e.g. Next.js App Router)
              this.renderCount++;
              this.intervalRenderCount++;
            }
          } else {
            this.renderCount++;
            this.intervalRenderCount++;
          }

          this.emit();
        },
      };

      const securedOptions =
        typeof bippy.secure === 'function'
          ? bippy.secure(options, {})
          : options;

      this.supported = true;
      this.checkHydration();
      bippy.instrument(securedOptions);
      // bippy.instrument patches the hook in place; no unsubscribe
      this.cleanup = null;
    } catch {
      this.startWithDevToolsHook();
    }
  }

  private getFiberDisplayName(fiber: BippyFiber): string {
    const type = fiber.type;
    if (typeof type === 'object' && type !== null && 'displayName' in type) {
      return String((type as { displayName?: string }).displayName ?? 'Unknown');
    }
    if (typeof type === 'object' && type !== null && 'name' in type) {
      return String((type as { name?: string }).name ?? 'Unknown');
    }
    if (typeof type === 'string') {
      return type;
    }
    return 'Unknown';
  }

  private startWithDevToolsHook(): void {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) {
      this.supported = false;
      this.emit();
      return;
    }

    this.supported = true;
    this.checkHydration();

    const origOnCommit = hook.onCommitFiberRoot;
    hook.onCommitFiberRoot = (
      rendererID: number,
      root: unknown,
      priority?: number
    ) => {
      this.commitCount++;
      this.renderCount++;
      this.intervalRenderCount++;
      this.emit();
      if (typeof origOnCommit === 'function') {
        return origOnCommit.call(hook, rendererID, root, priority);
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
