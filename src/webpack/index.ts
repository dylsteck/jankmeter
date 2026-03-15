import type { JankMeterConfig } from '../core/types';

interface Compiler {
  options: { mode?: string };
  hooks: {
    compilation: {
      tap: (name: string, cb: (compilation: any) => void) => void;
    };
  };
}

export class JankMeterWebpackPlugin {
  private config: JankMeterConfig;

  constructor(config: JankMeterConfig = {}) {
    this.config = config;
  }

  apply(compiler: Compiler): void {
    if (compiler.options.mode === 'production') return;

    const configJson = JSON.stringify(this.config);

    compiler.hooks.compilation.tap('JankMeterWebpackPlugin', (compilation: any) => {
      try {
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        const hooks = HtmlWebpackPlugin.getHooks(compilation);

        hooks.alterAssetTagGroups.tap('JankMeterWebpackPlugin', (data: any) => {
          data.headTags.unshift({
            tagName: 'script',
            voidTag: false,
            attributes: { type: 'module' },
            innerHTML: `import { init } from 'jankmeter'; init(${configJson});`,
            meta: { plugin: 'jankmeter' },
          });
          return data;
        });
      } catch {
        console.warn('[jankmeter] html-webpack-plugin not found. Install it to auto-inject jankmeter.');
      }
    });
  }
}
