import { getStyles } from './styles';

const HOST_TAG = 'jank-meter-host';

export function createHost(): { host: HTMLElement; root: ShadowRoot } {
  // Define custom element if needed
  if (!customElements.get(HOST_TAG)) {
    customElements.define(HOST_TAG, class extends HTMLElement {});
  }

  const host = document.createElement(HOST_TAG);
  const root = host.attachShadow({ mode: 'open' });

  // Inject styles
  const style = document.createElement('style');
  style.textContent = getStyles();
  root.appendChild(style);

  document.body.appendChild(host);
  return { host, root };
}

export function destroyHost(host: HTMLElement): void {
  host.remove();
}
