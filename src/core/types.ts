export type Severity = 'good' | 'warn' | 'bad';

export interface FpsMetrics {
  fps: number;
  jankPercent: number;
  longFrames: number;
  targetFps: number;
  history: number[];
}

export interface DelayMetrics {
  lastDelay: number;
  maxDelay: number;
  p98Delay: number;
  history: number[];
}

export interface MemoryMetrics {
  usedMB: number;
  totalMB: number;
  limitMB: number;
  formatted: string;
  supported: boolean;
  history: number[];
}

export interface NetworkRequest {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
  size?: number;
}

export interface NetworkMetrics {
  inFlight: number;
  recentRequests: NetworkRequest[];
  history: number[];
}

export interface ReactMetrics {
  commitCount: number;
  renderCount: number;
  recentRenders: { name: string; duration: number }[];
  commitDuration: number;
  supported: boolean;
  history: number[];
}

export interface HydrationMetrics {
  detected: boolean;
  duration: number | null;
  timestamp: number | null;
}

export interface AllMetrics {
  fps: FpsMetrics;
  delay: DelayMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  react: ReactMetrics;
  hydration: HydrationMetrics;
}

export interface JankMeterConfig {
  enabled?: boolean;
  shortcut?: string;
  throttleMs?: number;
  maxHistory?: number;
  onMetrics?: (metrics: AllMetrics) => void;
}

export function getSeverity(metric: keyof AllMetrics | 'jank' | 'hydrationDuration', value: number): Severity {
  switch (metric) {
    case 'fps':
      return value >= 55 ? 'good' : value >= 30 ? 'warn' : 'bad';
    case 'jank':
      return value < 5 ? 'good' : value <= 15 ? 'warn' : 'bad';
    case 'delay':
      return value < 100 ? 'good' : value <= 300 ? 'warn' : 'bad';
    case 'memory':
      return value < 200 ? 'good' : value <= 500 ? 'warn' : 'bad';
    case 'network':
      return value <= 2 ? 'good' : value <= 5 ? 'warn' : 'bad';
    case 'hydrationDuration':
      return value < 100 ? 'good' : value <= 500 ? 'warn' : 'bad';
    case 'react':
      return 'good';
    case 'hydration':
      return 'good';
    default:
      return 'good';
  }
}
