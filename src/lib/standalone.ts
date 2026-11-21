const assetGlobal = globalThis as {
  __OMADA_ASSET_BASE__?: string;
  React?: typeof ReactNS;
  ReactDOM?: typeof ReactDOMNS;
};

if (!assetGlobal.__OMADA_ASSET_BASE__ && typeof document !== 'undefined') {
  const currentScript = document.currentScript as HTMLScriptElement | null;
  if (currentScript?.src) {
    try {
      assetGlobal.__OMADA_ASSET_BASE__ = new URL('./', currentScript.src).href;
    } catch {
      // Ignore invalid script URLs
    }
  }
}

import * as ReactNS from 'react';
import * as ReactDOMNS from 'react-dom/client';
import * as antd from 'antd';
import * as AntdIcons from '@ant-design/icons';

assetGlobal.React ??= ReactNS;
assetGlobal.ReactDOM ??= ReactDOMNS;

export * from '../omada';
export { ReactNS as React, ReactDOMNS as ReactDOM, antd, AntdIcons };

const mountedRoots = new WeakMap<HTMLElement, ReactDOMNS.Root>();

/**
 * Convenience mount helper for zero-build single-file HTML demos (`window.OmadaUI.render(...)`).
 */
export function render(
  element: ReactNS.ReactElement,
  target: string | HTMLElement = '#root',
): ReactDOMNS.Root {
  const container =
    typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!container) {
    throw new Error(`OmadaUI.render: target container not found (${String(target)}).`);
  }
  let root = mountedRoots.get(container);
  if (!root) {
    root = ReactDOMNS.createRoot(container);
    mountedRoots.set(container, root);
  }
  root.render(element);
  return root;
}
