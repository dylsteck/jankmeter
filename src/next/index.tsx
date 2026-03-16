import { useEffect } from 'react';
import type { JankMeterConfig } from '../core/types';

export function JankMeter(props: JankMeterConfig = {}) {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    import('../core/index').then(({ init, destroy }) => {
      init(props);
      cleanup = destroy;
    });

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}

export type { JankMeterConfig };
