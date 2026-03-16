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
  const serializableConfig = Object.fromEntries(
    Object.entries(config).filter(([k, v]) => {
      if (typeof v === 'function') {
        console.warn(
          `[jankmeter] Config key "${k}" is a function and cannot be passed via the plugin. Use init() directly.`
        );
        return false;
      }
      return true;
    })
  );
  const configJson = JSON.stringify(serializableConfig);

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
