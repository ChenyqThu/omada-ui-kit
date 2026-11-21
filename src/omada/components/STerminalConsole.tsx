import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import { Search, X } from 'lucide-react';
import { SIcon } from '../assets/SIcon';
import { SInput } from './SInput';

export interface STerminalSessionItem {
  /** Unique identifier for the session or diagnostic output entry. */
  key: string;
  /** Device name displayed in the `Device List` rail (e.g. `COOOffice_Eap_1`). */
  deviceName: string;
  /** Optional subtitle such as IP address or model displayed in the terminal bar. */
  subtitle?: string;
  /** Current execution or connection status. */
  status?: 'active' | 'running' | 'completed' | 'closed' | 'error';
  /** Monospace output lines rendered inside the dark terminal surface. */
  lines: string[];
  /** CLI prompt prefix shown when `interactive` mode is enabled. */
  prompt?: string;
}

export interface STerminalConsoleProps {
  /** Section title on the left of the header bar (e.g. `'Device Output'` or `'Sessions'`). */
  title?: React.ReactNode;
  /** Placeholder for the right-aligned filled search field. */
  searchPlaceholder?: string;
  /** Centered muted message displayed inside the dark terminal box when empty. */
  emptyText?: React.ReactNode;
  /** Diagnostic device outputs or interactive CLI sessions. */
  sessions?: STerminalSessionItem[];
  /** Controlled active session key. */
  activeKey?: string | null;
  /** Initial active session key for uncontrolled usage. */
  defaultActiveKey?: string | null;
  /** Callback fired when a device in `Device List` is clicked. */
  onSelectSession?: (key: string) => void;
  /** Optional callback fired when the close icon on a device pill is clicked. */
  onCloseSession?: (key: string) => void;
  /** Controlled search query string. */
  searchQuery?: string;
  /** Callback fired when the search input changes. */
  onSearchChange?: (query: string) => void;
  /** Callback fired when the Clear (broom) icon button is clicked. */
  onClear?: () => void;
  /** Callback fired when the Download icon button is clicked. */
  onDownload?: (activeSession: STerminalSessionItem | null) => void;
  /** Enables an interactive CLI command input prompt inside the terminal body. */
  interactive?: boolean;
  /** Callback fired when the user submits a CLI command in interactive mode. */
  onSubmitCommand?: (sessionKey: string, command: string) => void;
  /** Minimum height in pixels for the split `Device List` + dark terminal body. */
  minHeight?: number;
  /** Optional test identifier on the root container. */
  'data-testid'?: string;
  className?: string;
}

const FONT_SIZES = [13, 15, 17] as const;

const STATUS_BADGE_LABEL: Record<
  NonNullable<STerminalSessionItem['status']>,
  string
> = {
  active: 'Connected',
  running: 'Running',
  completed: 'Completed',
  closed: 'Closed',
  error: 'Failed',
};

const ClearBroomGlyph: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12.1782 5.05719H18.0991V9.41559H16.9155V18.1002H3.08447V9.41559H1.8999V5.05719H7.8208V1.89996H12.1782V5.05719ZM4.28369 16.9H6.24268V13.7086H7.44189V16.9H9.3999V13.7017H10.5991V16.9H12.5581V13.7086H13.7573V16.9H15.7153V9.41559H4.28369V16.9ZM9.021 6.25739H3.09912V8.21539H16.8999V6.25739H10.978V3.09918H9.021V6.25739Z"
      fill="currentColor"
    />
  </svg>
);

function classifyLineTone(line: string): 'prompt' | 'error' | 'summary' | 'normal' {
  const trimmed = line.trimStart();
  if (/^(>|#|\$)|^[A-Za-z0-9_.-]+#\s/.test(trimmed)) {
    return 'prompt';
  }
  if (/(error|failed|timeout|unreachable|100(\.0)?%\s+packet\s+loss)/i.test(trimmed)) {
    return 'error';
  }
  if (/^(---|PING\s|traceroute\s|Server:|Address:|packets transmitted|rtt\s)/i.test(trimmed)) {
    return 'summary';
  }
  return 'normal';
}

function renderHighlightedLine(line: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return line || '\u00A0';
  const lowerLine = line.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let matchIdx = lowerLine.indexOf(lowerQ, cursor);
  let chunkKey = 0;

  while (matchIdx !== -1) {
    if (matchIdx > cursor) {
      parts.push(line.slice(cursor, matchIdx));
    }
    parts.push(
      <mark key={chunkKey++} className="omada-terminal-highlight">
        {line.slice(matchIdx, matchIdx + q.length)}
      </mark>,
    );
    cursor = matchIdx + q.length;
    matchIdx = lowerLine.indexOf(lowerQ, cursor);
  }

  if (cursor < line.length) {
    parts.push(line.slice(cursor));
  }
  return parts.length > 0 ? parts : line || '\u00A0';
}

/**
 * Reusable Omada v6.3 split diagnostic terminal console featuring:
 * - Header bar with title, right-aligned filled search input, and Clear / Download / `A+` controls
 * - Left `Device List` rail (`200px` wide) displaying active session/output device pills
 * - Right dark monospace terminal surface (`#242424`) with centered empty prompt and optional interactive CLI input
 */
export const STerminalConsole: React.FC<STerminalConsoleProps> = ({
  title = 'Device Output',
  searchPlaceholder = 'Search Device Output',
  emptyText,
  sessions = [],
  activeKey,
  defaultActiveKey = null,
  onSelectSession,
  onCloseSession,
  searchQuery,
  onSearchChange,
  onClear,
  onDownload,
  interactive = false,
  onSubmitCommand,
  minHeight = 320,
  'data-testid': dataTestId,
  className = '',
}) => {
  const [innerActiveKey, setInnerActiveKey] = useState<string | null>(defaultActiveKey);
  const [innerSearch, setInnerSearch] = useState<string>('');
  const [fontSizeIdx, setFontSizeIdx] = useState<number>(0);
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number>(-1);
  const cliInputRef = useRef<HTMLInputElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);

  const resolvedSearch = searchQuery !== undefined ? searchQuery : innerSearch;
  const resolvedFontSize = FONT_SIZES[fontSizeIdx] ?? 13;

  const filteredSessions = useMemo(() => {
    const q = resolvedSearch.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (item) =>
        item.deviceName.toLowerCase().includes(q) ||
        (item.subtitle?.toLowerCase().includes(q) ?? false) ||
        item.lines.some((line) => line.toLowerCase().includes(q)),
    );
  }, [sessions, resolvedSearch]);

  const currentActiveKey = activeKey !== undefined ? activeKey : innerActiveKey;

  const activeSession = useMemo(() => {
    if (filteredSessions.length === 0) return null;
    if (currentActiveKey) {
      const matched = filteredSessions.find((s) => s.key === currentActiveKey);
      if (matched) return matched;
    }
    return filteredSessions[0] ?? null;
  }, [filteredSessions, currentActiveKey]);

  const hasSessions = sessions.length > 0;
  const activeLinesCount = activeSession?.lines.length ?? 0;

  useEffect(() => {
    if (outputRef.current && activeLinesCount > 0) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [activeSession?.key, activeLinesCount]);

  const handleSearchChange = (value: string) => {
    if (searchQuery === undefined) {
      setInnerSearch(value);
    }
    onSearchChange?.(value);
  };

  const handleSelectSession = (key: string) => {
    if (activeKey === undefined) {
      setInnerActiveKey(key);
    }
    onSelectSession?.(key);
  };

  const handleDownloadClick = () => {
    if (!hasSessions) return;
    if (onDownload) {
      onDownload(activeSession);
      return;
    }
    if (
      !activeSession ||
      typeof window === 'undefined' ||
      (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) ||
      typeof Blob === 'undefined'
    ) {
      return;
    }
    const content = activeSession.lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    if (typeof URL.createObjectURL === 'function') {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${activeSession.deviceName.toLowerCase()}-output.log`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCycleFontSize = () => {
    setFontSizeIdx((prev) => (prev + 1) % FONT_SIZES.length);
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !interactive) return;
    const trimmed = commandInput.trim();
    if (!trimmed) return;
    setCommandHistory((prev) => [trimmed, ...prev.slice(0, 29)]);
    setHistoryCursor(-1);
    setCommandInput('');
    onSubmitCommand?.(activeSession.key, trimmed);
  };

  const handleCliKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      if (commandHistory.length === 0) return;
      e.preventDefault();
      const nextIdx = Math.min(historyCursor + 1, commandHistory.length - 1);
      setHistoryCursor(nextIdx);
      setCommandInput(commandHistory[nextIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      if (historyCursor <= 0) {
        setHistoryCursor(-1);
        setCommandInput('');
        return;
      }
      e.preventDefault();
      const nextIdx = historyCursor - 1;
      setHistoryCursor(nextIdx);
      setCommandInput(commandHistory[nextIdx] ?? '');
    }
  };

  return (
    <section
      className={`omada-terminal-console ${className}`.trim()}
      data-testid={dataTestId}
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-[16px] font-medium leading-6 text-[var(--omada-text-primary)]">
          {title}
        </h2>

        <div className="flex items-center gap-3.5">
          <SInput
            variant="filled"
            allowClear
            value={resolvedSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={
              typeof searchPlaceholder === 'string'
                ? searchPlaceholder
                : 'Search terminal output'
            }
            suffix={<Search size={15} className="text-[var(--omada-text-tertiary)]" />}
            className="omada-tm-console-search"
          />

          <div className="flex items-center gap-2.5">
            <Tooltip title="Clear">
              <button
                type="button"
                aria-label="Clear output"
                disabled={!hasSessions}
                onClick={onClear}
                className={`omada-terminal-icon-btn ${hasSessions ? 'is-active' : 'is-muted'}`}
              >
                <ClearBroomGlyph />
              </button>
            </Tooltip>

            <Tooltip title="Download">
              <button
                type="button"
                aria-label="Download output"
                disabled={!hasSessions}
                onClick={handleDownloadClick}
                className={`omada-terminal-icon-btn ${hasSessions ? 'is-active' : 'is-muted'}`}
              >
                <SIcon name="download-2" size={18} />
              </button>
            </Tooltip>

            <Tooltip title={`Font Size (${resolvedFontSize}px)`}>
              <button
                type="button"
                aria-label="Toggle terminal font size"
                onClick={handleCycleFontSize}
                className={`omada-terminal-icon-btn omada-terminal-font-btn ${
                  hasSessions ? 'is-active' : 'is-muted'
                }`}
              >
                <span className="text-[14px] font-semibold leading-none tracking-tight">
                  A<sup className="text-[10px] font-bold">+</sup>
                </span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Split Body: Left Device List Rail + Right Dark Monospace Terminal */}
      <div
        className="mt-4 flex items-stretch gap-4"
        style={{ minHeight }}
      >
        <div className="w-[200px] shrink-0" role="navigation" aria-label="Device List">
          <div className="pt-1 text-[14px] font-normal leading-5 text-[var(--omada-text-tertiary)]">
            Device List
          </div>

          {filteredSessions.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5 pr-1">
              {filteredSessions.map((session) => {
                const isSelected = activeSession?.key === session.key;
                const statusClass =
                  session.status === 'running'
                    ? 'is-running'
                    : session.status === 'closed'
                      ? 'is-closed'
                      : session.status === 'error'
                        ? 'is-error'
                        : 'is-active';

                return (
                  <div
                    key={session.key}
                    className={`omada-terminal-device-pill ${isSelected ? 'is-selected' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectSession(session.key)}
                      aria-pressed={isSelected}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left text-inherit"
                    >
                      <span className={`omada-terminal-status-dot ${statusClass}`} />
                      <span className="truncate text-[13px] leading-5">
                        {session.deviceName}
                      </span>
                    </button>

                    {onCloseSession && (
                      <button
                        type="button"
                        aria-label={`Close session ${session.deviceName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseSession(session.key);
                        }}
                        className="omada-terminal-pill-close"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="omada-terminal-box flex min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] font-mono"
          onClick={() => {
            if (interactive && activeSession) {
              cliInputRef.current?.focus();
            }
          }}
        >
          {/* Subtle top terminal strip matching Omada v6.3 reference */}
          <div className="omada-terminal-topbar flex h-[34px] shrink-0 items-center justify-between px-4">
            {activeSession ? (
              <>
                <div className="flex min-w-0 items-center gap-2 text-[12px] font-medium">
                  <span className="truncate omada-terminal-topbar-title">
                    {activeSession.deviceName}
                  </span>
                  {activeSession.subtitle && (
                    <span className="truncate omada-terminal-topbar-sub">
                      {activeSession.subtitle}
                    </span>
                  )}
                </div>
                {activeSession.status && (
                  <span className="omada-terminal-status-badge">
                    {STATUS_BADGE_LABEL[activeSession.status]}
                  </span>
                )}
              </>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>

          {/* Terminal output area */}
          {activeSession ? (
            <div
              ref={outputRef}
              className="omada-terminal-output flex-1 overflow-y-auto px-4 py-3 leading-[1.6]"
              style={{ fontSize: resolvedFontSize }}
            >
              {activeSession.lines.map((line, index) => {
                const tone = classifyLineTone(line);
                return (
                  <div
                    key={`${activeSession.key}-line-${index}`}
                    className={`omada-terminal-line whitespace-pre-wrap break-words is-${tone}`}
                  >
                    {renderHighlightedLine(line, resolvedSearch)}
                  </div>
                );
              })}

              {interactive && activeSession.status !== 'closed' && (
                <form
                  onSubmit={handleCliSubmit}
                  className="mt-2 flex items-center gap-2"
                >
                  <span className="omada-terminal-prompt-prefix shrink-0">
                    {activeSession.prompt ?? `${activeSession.deviceName}#`}
                  </span>
                  <input
                    ref={cliInputRef}
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={handleCliKeyDown}
                    aria-label="Terminal command input"
                    placeholder="Type CLI command (help, show version, ping 8.8.8.8)..."
                    className="omada-terminal-cli-input min-w-0 flex-1 border-none bg-transparent font-mono outline-none"
                    style={{ fontSize: resolvedFontSize }}
                  />
                </form>
              )}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 py-6 text-center font-sans text-[14px]">
              {emptyText ? (
                <span className="omada-terminal-empty-text">{emptyText}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
