declare const __OMADA_PKG_VERSION__: string | undefined;

const CDN_FALLBACK_ASSET_BASE =
  typeof __OMADA_PKG_VERSION__ === 'string' && __OMADA_PKG_VERSION__.length > 0
    ? `https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@${__OMADA_PKG_VERSION__}/dist/`
    : 'https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@0.5.0/dist/';

const assetGlobal = globalThis as {
  __OMADA_ASSET_BASE__?: string;
  React?: typeof ReactNS;
  ReactDOM?: typeof ReactDOMNS;
};

export function resolveStandaloneScriptBase(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const currentScript = document.currentScript as HTMLScriptElement | null;
  const rawCurrentAttr =
    typeof currentScript?.getAttribute === 'function'
      ? currentScript.getAttribute('src')
      : currentScript?.src;
  const currentAttr = rawCurrentAttr?.trim();
  if (currentAttr && currentScript?.src) {
    try {
      return new URL('./', currentScript.src).href;
    } catch {
      // Ignore invalid or non-hierarchical script URLs (e.g. blob: / data:)
    }
  }
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'));
  for (let i = scripts.length - 1; i >= 0; i -= 1) {
    const rawSrc = scripts[i]?.getAttribute('src')?.trim();
    const src = scripts[i]?.src;
    if (rawSrc && src && /(?:^|\/)standalone\.js(?:[?#]|$)/i.test(src)) {
      try {
        return new URL('./', src).href;
      } catch {
        // Ignore invalid or non-hierarchical script URLs
      }
    }
  }
  return CDN_FALLBACK_ASSET_BASE;
}

if (!assetGlobal.__OMADA_ASSET_BASE__) {
  const detectedBase = resolveStandaloneScriptBase();
  if (detectedBase) {
    assetGlobal.__OMADA_ASSET_BASE__ = detectedBase;
  }
}

import * as ReactNS from 'react';
import * as ReactDOMNS from 'react-dom/client';
import {
  Alert,
  Anchor,
  App,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Cascader,
  Checkbox,
  Col,
  Collapse,
  ColorPicker,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  Form,
  Grid,
  Input,
  InputNumber,
  Layout,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Radio,
  Rate,
  Row,
  Segmented,
  Select,
  Skeleton,
  Slider,
  Space,
  Spin,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Tooltip,
  Transfer,
  TreeSelect,
  Typography,
  Upload,
  message,
  notification,
  theme,
} from 'antd';
import {
  ApiOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BellOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  CloseOutlined,
  ClusterOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FilterOutlined,
  GlobalOutlined,
  ImportOutlined,
  InfoCircleFilled,
  InfoCircleOutlined,
  LeftOutlined,
  LoadingOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SettingOutlined,
  SyncOutlined,
  TeamOutlined,
  UnlockOutlined,
  UpOutlined,
  UploadOutlined,
  UserOutlined,
  WarningOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import * as agent from './agent';

const antd: Record<string, unknown> = {
  Alert,
  Anchor,
  App,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Cascader,
  Checkbox,
  Col,
  Collapse,
  ColorPicker,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  Form,
  Grid,
  Input,
  InputNumber,
  Layout,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Radio,
  Rate,
  Row,
  Segmented,
  Select,
  Skeleton,
  Slider,
  Space,
  Spin,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Tooltip,
  Transfer,
  TreeSelect,
  Typography,
  Upload,
  message,
  notification,
  theme,
};

const AntdIcons: Record<string, unknown> = {
  ApiOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BellOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  CloseOutlined,
  ClusterOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FilterOutlined,
  GlobalOutlined,
  ImportOutlined,
  InfoCircleFilled,
  InfoCircleOutlined,
  LeftOutlined,
  LoadingOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SettingOutlined,
  SyncOutlined,
  TeamOutlined,
  UnlockOutlined,
  UpOutlined,
  UploadOutlined,
  UserOutlined,
  WarningOutlined,
  WifiOutlined,
};

assetGlobal.React ??= ReactNS;
assetGlobal.ReactDOM ??= ReactDOMNS;

export * from '../omada';
export { ReactNS as React, ReactDOMNS as ReactDOM, antd, AntdIcons, agent };

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
