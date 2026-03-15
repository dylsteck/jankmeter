import { EventBus } from './event-bus';
import { FpsCollector } from './fps-collector';
import { DelayCollector } from './delay-collector';
import { MemoryCollector } from './memory-collector';
import { NetworkCollector } from './network-collector';
import { ReactCollector } from './react-collector';
import { Toolbar } from './toolbar';
import type { JankMeterConfig, AllMetrics } from './types';

let bus: EventBus | null = null;
let fpsCollector: FpsCollector | null = null;
let delayCollector: DelayCollector | null = null;
let memoryCollector: MemoryCollector | null = null;
let networkCollector: NetworkCollector | null = null;
let reactCollector: ReactCollector | null = null;
let toolbar: Toolbar | null = null;
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
let initialized = false;

export function init(config: JankMeterConfig = {}): void {
  if (initialized) return;
  if (config.enabled === false) return;

  // Production guard
  try {
    if (process.env.NODE_ENV === 'production') return;
  } catch {}

  // SSR guard
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  initialized = true;

  const maxHistory = config.maxHistory ?? 60;
  const throttleMs = config.throttleMs ?? 500;

  bus = new EventBus();

  // Start collectors
  fpsCollector = new FpsCollector(bus, maxHistory);
  fpsCollector.start();

  delayCollector = new DelayCollector(bus, maxHistory);
  delayCollector.start();

  memoryCollector = new MemoryCollector(bus, maxHistory);
  memoryCollector.start();

  networkCollector = new NetworkCollector(bus, maxHistory);
  networkCollector.start();

  reactCollector = new ReactCollector(bus, maxHistory);
  reactCollector.start();

  // Mount toolbar
  toolbar = new Toolbar(bus, {
    throttleMs,
    onMetrics: config.onMetrics,
    shortcut: config.shortcut,
  });
  toolbar.mount();

  // Keyboard shortcut
  const shortcut = config.shortcut ?? 'Ctrl+Shift+M';
  keydownHandler = (e: KeyboardEvent) => {
    const ctrlOrMeta = e.ctrlKey || e.metaKey;
    if (ctrlOrMeta && e.shiftKey && e.key.toUpperCase() === 'M') {
      e.preventDefault();
      toolbar?.toggle();
    }
  };
  document.addEventListener('keydown', keydownHandler);
}

export function destroy(): void {
  if (!initialized) return;
  initialized = false;

  fpsCollector?.stop();
  delayCollector?.stop();
  memoryCollector?.stop();
  networkCollector?.stop();
  reactCollector?.stop();
  toolbar?.destroy();
  bus?.destroy();

  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
  }

  bus = null;
  fpsCollector = null;
  delayCollector = null;
  memoryCollector = null;
  networkCollector = null;
  reactCollector = null;
  toolbar = null;
}

export function getMetrics(): AllMetrics | null {
  if (!toolbar) return null;
  return toolbar.getLatestMetrics();
}

export type { JankMeterConfig, AllMetrics } from './types';
