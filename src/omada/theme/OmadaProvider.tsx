import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntdApp, ConfigProvider } from 'antd';
import { buildOmadaAntdTheme } from './antdTheme';
import {
  omadaSemanticTokens,
  type ResolvedTheme,
  type SemanticTokenSet,
  type ThemeMode,
} from './tokens';

const STORAGE_KEY = 'omada-theme-mode';

interface OmadaThemeContextValue {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  tokens: SemanticTokenSet;
  setThemeMode: (mode: ThemeMode) => void;
}

const OmadaThemeContext = createContext<OmadaThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredThemeMode(fallback: ThemeMode): ThemeMode {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    // Ignore storage access errors in restricted frames
  }
  return fallback;
}

export interface OmadaProviderProps {
  children: React.ReactNode;
  defaultThemeMode?: ThemeMode;
  /**
   * When `true` (default), syncs `<html data-theme>` and `.dark` on `document.documentElement`.
   * When `false`, isolates theme variables to a local `<div className="omada-scope" data-theme={resolvedTheme}>`
   * container and mounts Ant Design popups inside that container so host apps are never mutated.
   */
  syncDocumentTheme?: boolean;
}

/**
 * Root theme & styling provider for Omada UI Kit.
 * Syncs Light / Dark / System mode to `<html data-theme>` + `.dark` (or local `.omada-scope` when `syncDocumentTheme={false}`)
 * and wraps AntD 6 `<StyleProvider layer>`.
 */
export const OmadaProvider: React.FC<OmadaProviderProps> = ({
  children,
  defaultThemeMode = 'light',
  syncDocumentTheme = true,
}) => {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() =>
    syncDocumentTheme ? readStoredThemeMode(defaultThemeMode) : defaultThemeMode,
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme =
    themeMode === 'system' ? systemTheme : themeMode;

  useEffect(() => {
    if (!syncDocumentTheme || typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme, syncDocumentTheme]);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      if (syncDocumentTheme && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, mode);
        } catch {
          // Ignore storage write errors
        }
      }
    },
    [syncDocumentTheme],
  );

  const antdThemeConfig = useMemo(
    () => buildOmadaAntdTheme(resolvedTheme),
    [resolvedTheme],
  );

  const getScopedPopupContainer = useCallback(
    () => scopeRef.current ?? document.body,
    [],
  );

  const contextValue = useMemo<OmadaThemeContextValue>(
    () => ({
      themeMode,
      resolvedTheme,
      tokens: omadaSemanticTokens[resolvedTheme],
      setThemeMode,
    }),
    [themeMode, resolvedTheme, setThemeMode],
  );

  const appTree = (
    <ConfigProvider
      theme={antdThemeConfig}
      getPopupContainer={syncDocumentTheme ? undefined : getScopedPopupContainer}
    >
      <AntdApp
        message={syncDocumentTheme ? undefined : { getContainer: getScopedPopupContainer }}
        notification={syncDocumentTheme ? undefined : { getContainer: getScopedPopupContainer }}
      >
        {children}
      </AntdApp>
    </ConfigProvider>
  );

  return (
    <OmadaThemeContext.Provider value={contextValue}>
      <StyleProvider layer>
        {syncDocumentTheme ? (
          appTree
        ) : (
          <div
            ref={scopeRef}
            className={`omada-scope ${resolvedTheme === 'dark' ? 'dark' : ''}`.trim()}
            data-theme={resolvedTheme}
          >
            {appTree}
          </div>
        )}
      </StyleProvider>
    </OmadaThemeContext.Provider>
  );
};

/**
 * Access current Omada theme mode (`light` | `dark` | `system`), resolved theme, and semantic tokens.
 */
export function useOmadaTheme(): OmadaThemeContextValue {
  const ctx = useContext(OmadaThemeContext);
  if (!ctx) {
    throw new Error('useOmadaTheme must be used inside <OmadaProvider>.');
  }
  return ctx;
}
