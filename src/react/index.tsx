import { useEffect } from 'react';
import type { JankMeterConfig } from '../core/types';
import { init, destroy, getMetrics } from '../core/index';

export function JankMeter(props: JankMeterConfig) {
  useEffect(() => {
    init(props);
    return () => destroy();
  }, []);
  return null;
}

export { getMetrics };
export type { JankMeterConfig };
