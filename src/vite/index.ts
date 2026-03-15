import type { JankMeterConfig } from '../core/types';

interface VitePlugin {
  name: string;
  apply?: 'serve' | 'build';
  transformIndexHtml?: () => Array<{
    tag: string;
    attrs?: Record<string, string>;
    children?: string;
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
  }>;
}

export function jankMeter(config: JankMeterConfig = {}): VitePlugin {
  const configJson = JSON.stringify(config);

  return {
    name: 'jankmeter',
    apply: 'serve',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: `import { init } from 'jankmeter'; init(${configJson});`,
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}
