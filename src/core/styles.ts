export function getStyles(): string {
  return `
    :host {
      all: initial;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2147483647;
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1;
      pointer-events: auto;
    }

    .jm-toolbar {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 6px 10px;
      background: rgba(13, 13, 17, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      color: #e4e4e7;
      user-select: none;
    }

    .jm-cell {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 2px 8px;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      white-space: nowrap;
    }

    .jm-cell:last-of-type {
      border-right: none;
    }

    .jm-label {
      color: rgba(161, 161, 170, 0.8);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .jm-value {
      color: #e4e4e7;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    .jm-value.good { color: #4ade80; }
    .jm-value.warn { color: #fbbf24; }
    .jm-value.bad { color: #f87171; }

    .jm-sparkline {
      display: inline-flex;
      align-items: center;
    }

    .jm-sparkline svg {
      display: block;
    }

    .jm-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
      padding-left: 8px;
    }

    .jm-btn {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(161, 161, 170, 0.8);
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: inherit;
      font-size: 11px;
      line-height: 1;
      transition: color 0.15s, border-color 0.15s;
    }

    .jm-btn:hover {
      color: #e4e4e7;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .jm-dot {
      position: fixed;
      bottom: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.15s, opacity 0.15s;
      z-index: 2147483647;
    }

    .jm-dot:hover {
      transform: scale(1.5);
    }

    .jm-dot.good { background: #4ade80; }
    .jm-dot.warn { background: #fbbf24; }
    .jm-dot.bad { background: #f87171; }

    .jm-hidden {
      display: none;
    }

    .jm-shortcut {
      color: rgba(161, 161, 170, 0.4);
      font-size: 10px;
      padding: 0 4px;
    }
  `;
}
