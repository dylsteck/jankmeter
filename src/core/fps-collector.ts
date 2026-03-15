import { EventBus } from './event-bus';
import type { FpsMetrics } from './types';

export class FpsCollector {
  private bus: EventBus;
  private rafId: number | null = null;
  private frameTimes: number[] = [];
  private history: number[] = [];
  private maxHistory: number;
  private targetFps = 60;
  private calibrationFrames: number[] = [];
  private calibrated = false;
  private lastTime = 0;
  private pausedFrames = 0;
  private readonly WINDOW_MS = 1000;
  private readonly CALIBRATION_COUNT = 30;
  private readonly RESUME_DISCARD = 5;

  constructor(bus: EventBus, maxHistory = 60) {
    this.bus = bus;
    this.maxHistory = maxHistory;
  }

  start(): void {
    if (typeof requestAnimationFrame === 'undefined') return;

    // Pause on visibility change
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  private onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      this.pausedFrames = this.RESUME_DISCARD;
      this.lastTime = performance.now();
    }
  };

  private tick = (now: number): void => {
    this.rafId = requestAnimationFrame(this.tick);

    if (this.pausedFrames > 0) {
      this.pausedFrames--;
      this.lastTime = now;
      return;
    }

    if (document.visibilityState === 'hidden') return;

    const delta = now - this.lastTime;
    this.lastTime = now;

    if (delta <= 0 || delta > 1000) return;

    // Calibrate target FPS from first N frames
    if (!this.calibrated) {
      this.calibrationFrames.push(delta);
      if (this.calibrationFrames.length >= this.CALIBRATION_COUNT) {
        const sorted = [...this.calibrationFrames].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        this.targetFps = Math.round(1000 / median);
        this.calibrated = true;
      }
    }

    this.frameTimes.push(delta);

    // Keep only last WINDOW_MS of frames
    const cutoff = now - this.WINDOW_MS;
    let totalTime = 0;
    let i = this.frameTimes.length - 1;
    while (i >= 0) {
      totalTime += this.frameTimes[i];
      if (totalTime > this.WINDOW_MS) break;
      i--;
    }
    this.frameTimes = this.frameTimes.slice(Math.max(0, i));

    // Calculate FPS and jank
    const frameCount = this.frameTimes.length;
    const fps = frameCount > 0 ? Math.round(frameCount * 1000 / totalTime) : 0;
    const expectedFrameTime = 1000 / this.targetFps;
    const longFrames = this.frameTimes.filter(t => t > expectedFrameTime * 1.5).length;
    const expectedFrames = Math.round(totalTime / expectedFrameTime);
    const droppedFrames = Math.max(0, expectedFrames - frameCount);
    const jankPercent = expectedFrames > 0 ? Math.round(droppedFrames / expectedFrames * 100) : 0;

    // Update history
    this.history.push(fps);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    const metrics: FpsMetrics = {
      fps,
      jankPercent,
      longFrames,
      targetFps: this.targetFps,
      history: [...this.history],
    };

    this.bus.emit('fps', metrics);
  };
}
