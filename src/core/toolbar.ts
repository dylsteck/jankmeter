import { EventBus } from './event-bus';
import { createHost, destroyHost } from './shadow-dom';
import { renderSparkline, renderBarChart } from './sparkline';
import type { AllMetrics, Severity } from './types';
import { getSeverity } from './types';

interface MetricCell {
  label: string;
  el: HTMLDivElement;
  valueEl: HTMLSpanElement;
  sparklineEl: HTMLSpanElement;
}

export class Toolbar {
  private bus: EventBus;
  private host: HTMLElement | null = null;
  private root: ShadowRoot | null = null;
  private toolbarEl: HTMLDivElement | null = null;
  private dotEl: HTMLDivElement | null = null;
  private cells: Record<string, MetricCell> = {};
  private throttleMs: number;
  private lastUpdate = 0;
  private minimized = false;
  private visible = true;
  private latestMetrics: Partial<AllMetrics> = {};
  private unsubscribers: (() => void)[] = [];
  private updateTimer: ReturnType<typeof setTimeout> | null = null;
  private onMetrics?: (metrics: AllMetrics) => void;
  private shortcutLabel: string;

  constructor(bus: EventBus, opts: { throttleMs?: number; onMetrics?: (m: AllMetrics) => void; shortcut?: string } = {}) {
    this.bus = bus;
    this.throttleMs = opts.throttleMs ?? 500;
    this.onMetrics = opts.onMetrics;
    this.shortcutLabel = opts.shortcut ?? (typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘⇧M' : 'Ctrl+Shift+M');
  }

  mount(): void {
    const { host, root } = createHost();
    this.host = host;
    this.root = root;

    // Create toolbar
    this.toolbarEl = document.createElement('div');
    this.toolbarEl.className = 'jm-toolbar';

    // Create metric cells
    const metricDefs = [
      { key: 'fps', label: 'FPS' },
      { key: 'jank', label: 'Jank' },
      { key: 'delay', label: 'Delay' },
      { key: 'memory', label: 'Mem' },
      { key: 'network', label: 'Net' },
      { key: 'react', label: 'React' },
      { key: 'hydration', label: 'Hydr' },
    ];

    for (const def of metricDefs) {
      const cell = document.createElement('div');
      cell.className = 'jm-cell';

      const label = document.createElement('span');
      label.className = 'jm-label';
      label.textContent = def.label;

      const sparkline = document.createElement('span');
      sparkline.className = 'jm-sparkline';

      const value = document.createElement('span');
      value.className = 'jm-value';
      value.textContent = '--';

      cell.appendChild(label);
      cell.appendChild(sparkline);
      cell.appendChild(value);
      this.toolbarEl.appendChild(cell);

      this.cells[def.key] = { label: def.label, el: cell, valueEl: value, sparklineEl: sparkline };
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'jm-actions';

    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'jm-btn';
    downloadBtn.textContent = '↓';
    downloadBtn.title = 'Download metrics';
    downloadBtn.addEventListener('click', () => this.downloadMetrics());

    // Minimize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'jm-btn';
    minimizeBtn.textContent = '−';
    minimizeBtn.title = 'Minimize';
    minimizeBtn.addEventListener('click', () => this.minimize());

    // Shortcut hint
    const shortcutHint = document.createElement('span');
    shortcutHint.className = 'jm-shortcut';
    shortcutHint.textContent = this.shortcutLabel;

    actions.appendChild(downloadBtn);
    actions.appendChild(minimizeBtn);
    actions.appendChild(shortcutHint);
    this.toolbarEl.appendChild(actions);

    root.appendChild(this.toolbarEl);

    // Create minimized dot
    this.dotEl = document.createElement('div');
    this.dotEl.className = 'jm-dot good jm-hidden';
    this.dotEl.addEventListener('click', () => this.restore());
    root.appendChild(this.dotEl);

    // Subscribe to events
    this.unsubscribers.push(this.bus.on('fps', (m) => { this.latestMetrics.fps = m; this.scheduleUpdate(); }));
    this.unsubscribers.push(this.bus.on('delay', (m) => { this.latestMetrics.delay = m; this.scheduleUpdate(); }));
    this.unsubscribers.push(this.bus.on('memory', (m) => { this.latestMetrics.memory = m; this.scheduleUpdate(); }));
    this.unsubscribers.push(this.bus.on('network', (m) => { this.latestMetrics.network = m; this.scheduleUpdate(); }));
    this.unsubscribers.push(this.bus.on('react', (m) => { this.latestMetrics.react = m; this.scheduleUpdate(); }));
    this.unsubscribers.push(this.bus.on('hydration', (m) => { this.latestMetrics.hydration = m; this.scheduleUpdate(); }));

    // Restore state from localStorage
    this.restoreState();
  }

  private scheduleUpdate(): void {
    const now = Date.now();
    if (now - this.lastUpdate >= this.throttleMs) {
      this.updateDOM();
      return;
    }
    if (!this.updateTimer) {
      this.updateTimer = setTimeout(() => {
        this.updateTimer = null;
        this.updateDOM();
      }, this.throttleMs - (now - this.lastUpdate));
    }
  }

  private updateDOM(): void {
    this.lastUpdate = Date.now();
    const m = this.latestMetrics;

    // FPS
    if (m.fps) {
      const severity = getSeverity('fps', m.fps.fps);
      this.updateCell('fps', `${m.fps.fps}`, severity, m.fps.history);
      const jankSeverity = getSeverity('jank', m.fps.jankPercent);
      this.updateCell('jank', `${m.fps.jankPercent}%`, jankSeverity, m.fps.history.map((_, i, arr) => {
        // Derive jank history from fps history
        return m.fps!.jankPercent;
      }));
    }

    // Delay
    if (m.delay) {
      const severity = getSeverity('delay', m.delay.lastDelay);
      this.updateCell('delay', `${m.delay.lastDelay}ms`, severity, m.delay.history);
    }

    // Memory
    if (m.memory) {
      if (m.memory.supported) {
        const severity = getSeverity('memory', m.memory.usedMB);
        this.updateCell('memory', m.memory.formatted, severity, m.memory.history);
      } else {
        this.updateCell('memory', 'N/A', 'good', []);
      }
    }

    // Network
    if (m.network) {
      const severity = getSeverity('network', m.network.inFlight);
      this.updateCell('network', `${m.network.inFlight}`, severity, m.network.history, true);
    }

    // React
    if (m.react) {
      if (m.react.supported) {
        this.updateCell('react', `${m.react.renderCount}`, 'good', m.react.history);
      } else {
        this.updateCell('react', 'N/A', 'good', []);
      }
    }

    // Hydration
    if (m.hydration) {
      if (m.hydration.detected && m.hydration.duration !== null) {
        const severity = getSeverity('hydrationDuration', m.hydration.duration);
        this.updateCell('hydration', `${Math.round(m.hydration.duration)}ms`, severity, []);
      } else {
        this.updateCell('hydration', 'N/A', 'good', []);
      }
    }

    // Update dot severity (worst across all)
    this.updateDotSeverity();

    // Fire onMetrics callback
    if (this.onMetrics) {
      const defaults = this.getDefaultMetrics();
      this.onMetrics({ ...defaults, ...m } as AllMetrics);
    }
  }

  private updateCell(key: string, value: string, severity: Severity, history: number[], bars = false): void {
    const cell = this.cells[key];
    if (!cell) return;
    cell.valueEl.textContent = value;
    cell.valueEl.className = `jm-value ${severity}`;

    if (history.length > 1) {
      cell.sparklineEl.innerHTML = bars
        ? renderBarChart(history, { color: this.severityColor(severity) })
        : renderSparkline(history, { color: this.severityColor(severity) });
    }
  }

  private severityColor(severity: Severity): string {
    switch (severity) {
      case 'good': return '#4ade80';
      case 'warn': return '#fbbf24';
      case 'bad': return '#f87171';
    }
  }

  private updateDotSeverity(): void {
    if (!this.dotEl) return;
    const m = this.latestMetrics;
    let worst: Severity = 'good';

    const check = (s: Severity) => {
      if (s === 'bad') worst = 'bad';
      else if (s === 'warn' && worst !== 'bad') worst = 'warn';
    };

    if (m.fps) {
      check(getSeverity('fps', m.fps.fps));
      check(getSeverity('jank', m.fps.jankPercent));
    }
    if (m.delay) check(getSeverity('delay', m.delay.lastDelay));
    if (m.memory?.supported) check(getSeverity('memory', m.memory.usedMB));
    if (m.network) check(getSeverity('network', m.network.inFlight));

    this.dotEl.className = `jm-dot ${worst}${this.minimized ? '' : ' jm-hidden'}`;
  }

  private getDefaultMetrics(): AllMetrics {
    return {
      fps: { fps: 0, jankPercent: 0, longFrames: 0, targetFps: 60, history: [] },
      delay: { lastDelay: 0, maxDelay: 0, p98Delay: 0, history: [] },
      memory: { usedMB: 0, totalMB: 0, limitMB: 0, formatted: 'N/A', supported: false, history: [] },
      network: { inFlight: 0, recentRequests: [], history: [] },
      react: { commitCount: 0, renderCount: 0, recentRenders: [], commitDuration: 0, supported: false, history: [] },
      hydration: { detected: false, duration: null, timestamp: null },
    };
  }

  show(): void {
    this.visible = true;
    if (this.toolbarEl) this.toolbarEl.classList.remove('jm-hidden');
    if (this.minimized && this.dotEl) {
      this.toolbarEl?.classList.add('jm-hidden');
    }
    this.saveState();
  }

  hide(): void {
    this.visible = false;
    if (this.toolbarEl) this.toolbarEl.classList.add('jm-hidden');
    if (this.dotEl) this.dotEl.classList.add('jm-hidden');
    this.saveState();
  }

  toggle(): void {
    if (this.visible) this.hide();
    else {
      this.visible = true;
      this.minimized = false;
      if (this.toolbarEl) this.toolbarEl.classList.remove('jm-hidden');
      if (this.dotEl) this.dotEl.classList.add('jm-hidden');
      this.saveState();
    }
  }

  minimize(): void {
    this.minimized = true;
    if (this.toolbarEl) this.toolbarEl.classList.add('jm-hidden');
    if (this.dotEl) this.dotEl.classList.remove('jm-hidden');
    this.updateDotSeverity();
    this.saveState();
  }

  restore(): void {
    this.minimized = false;
    if (this.toolbarEl) this.toolbarEl.classList.remove('jm-hidden');
    if (this.dotEl) this.dotEl.classList.add('jm-hidden');
    this.saveState();
  }

  private downloadMetrics(): void {
    const defaults = this.getDefaultMetrics();
    const data = { ...defaults, ...this.latestMetrics };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jankmeter-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private saveState(): void {
    try {
      localStorage.setItem('jankmeter:state', JSON.stringify({ visible: this.visible, minimized: this.minimized }));
    } catch {}
  }

  private restoreState(): void {
    try {
      const raw = localStorage.getItem('jankmeter:state');
      if (raw) {
        const state = JSON.parse(raw);
        if (state.visible === false) this.hide();
        else if (state.minimized) this.minimize();
      }
    } catch {}
  }

  getLatestMetrics(): AllMetrics {
    const defaults = this.getDefaultMetrics();
    return { ...defaults, ...this.latestMetrics } as AllMetrics;
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    if (this.updateTimer) clearTimeout(this.updateTimer);
    if (this.host) destroyHost(this.host);
    this.host = null;
    this.root = null;
    this.toolbarEl = null;
    this.dotEl = null;
    this.cells = {};
  }
}
