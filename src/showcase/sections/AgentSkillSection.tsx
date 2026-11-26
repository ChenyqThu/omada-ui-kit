import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Bot,
  Bug,
  Check,
  Copy,
  ExternalLink,
  GitBranch,
  Layers,
  MessageSquarePlus,
  Package,
  Puzzle,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  OmadaAgentProvider,
  Popover,
  SAlert,
  SButton,
  SCard,
  SCheckbox,
  SInput,
  SPageHeader,
  SPasswordInput,
  SSelect,
  SSwitch,
  STabs,
  STag,
  useDragSelect,
  useOmadaAgent,
  useOmadaAgentControl,
  useOmadaFeedback,
  useRovingFocus,
  useSelection,
} from '@/omada';

declare const __OMADA_PKG_VERSION__: string | undefined;
const PKG_VERSION =
  typeof __OMADA_PKG_VERSION__ === 'string' && __OMADA_PKG_VERSION__.length > 0
    ? __OMADA_PKG_VERSION__
    : '0.7.0';

const GITHUB_REPO_URL = 'https://github.com/ChenyqThu/omada-ui-kit';
const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;
const GITHUB_NEW_ISSUE_CHOOSE_URL = `${GITHUB_REPO_URL}/issues/new/choose`;
const GITHUB_MISSING_COMPONENT_URL = `${GITHUB_REPO_URL}/issues/new?template=missing-component.yml`;
const GITHUB_BUG_REPORT_URL = `${GITHUB_REPO_URL}/issues/new?template=component-bug.yml`;

export interface AgentSkillSectionProps {
  onNavigate?: (route: 'blocks' | 'templates') => void;
}

interface CopyCommandBoxProps {
  label?: string;
  badge?: string;
  command: string;
}

const CopyCommandBox: React.FC<CopyCommandBoxProps> = ({ label, badge, command }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useOmadaFeedback();

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(command);
      setCopied(true);
      toast.success(`Copied ${label ?? 'snippet'}`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.info(`Prepared ${label ?? 'snippet'}`);
    }
  };

  return (
    <div className="rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] p-3">
      {(label || badge) && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {label && (
              <span className="text-xs font-semibold text-[var(--omada-text-primary)]">
                {label}
              </span>
            )}
            {badge && <STag color="green">{badge}</STag>}
          </div>
          <SButton
            size="small"
            variant="secondary"
            aria-label={label ? `Copy ${label}` : 'Copy command'}
            icon={copied ? <Check size={13} /> : <Copy size={13} />}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </SButton>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <pre className="m-0 min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-[var(--omada-text-primary)]">
          <code>{command}</code>
        </pre>
        {!label && !badge && (
          <SButton
            size="small"
            variant="secondary"
            aria-label="Copy command"
            icon={copied ? <Check size={13} /> : <Copy size={13} />}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </SButton>
        )}
      </div>
    </div>
  );
};

interface AgentGuideConfig {
  key: string;
  label: string;
  projectPath: string;
  globalPath: string;
  cliCommand: string;
  manualCommand: string;
  altCommand?: string;
  usageTip: string;
  extraPaths?: Array<{ agent: string; path: string }>;
}

const AGENT_GUIDES: AgentGuideConfig[] = [
  {
    key: 'claude-code',
    label: 'Claude Code',
    projectPath: '.claude/skills/omada-ui-kit/',
    globalPath: '~/.claude/skills/omada-ui-kit/',
    cliCommand: 'npx skills add ChenyqThu/omada-ui-kit',
    manualCommand: [
      'pnpm add @chenyqthu/omada-ui-kit',
      'mkdir -p .claude/skills',
      'cp -r node_modules/@chenyqthu/omada-ui-kit/skills/omada-ui-kit .claude/skills/',
    ].join('\n'),
    usageTip:
      'Claude Code automatically discovers SKILL.md inside .claude/skills/ and activates it when you ask for an Omada Controller prototype, or you can mention "omada-ui-kit" explicitly.',
  },
  {
    key: 'cursor',
    label: 'Cursor',
    projectPath: '.cursor/skills/omada-ui-kit/',
    globalPath: '~/.cursor/skills/omada-ui-kit/',
    cliCommand: 'npx skills add ChenyqThu/omada-ui-kit',
    manualCommand: [
      'pnpm add @chenyqthu/omada-ui-kit',
      'mkdir -p .cursor/skills',
      'cp -r node_modules/@chenyqthu/omada-ui-kit/skills/omada-ui-kit .cursor/skills/',
    ].join('\n'),
    usageTip:
      'Cursor loads Agent Skills automatically in Agent mode (from .cursor/skills/ or .agents/skills/) whenever prompts reference Omada Controller UI, S* components, or single-file HTML mockups.',
  },
  {
    key: 'codex',
    label: 'OpenAI Codex',
    projectPath: '.agents/skills/omada-ui-kit/',
    globalPath: '~/.agents/skills/omada-ui-kit/',
    cliCommand: 'npx skills add ChenyqThu/omada-ui-kit',
    manualCommand: [
      'pnpm add @chenyqthu/omada-ui-kit',
      'mkdir -p .agents/skills',
      'cp -r node_modules/@chenyqthu/omada-ui-kit/skills/omada-ui-kit .agents/skills/',
    ].join('\n'),
    usageTip:
      'OpenAI Codex reads .agents/skills/omada-ui-kit/SKILL.md (and ~/.codex/skills/ for global user setups) and runs the bundled query-catalog.mjs and verify-demo.mjs Node scripts directly.',
  },
  {
    key: 'antigravity',
    label: 'Antigravity',
    projectPath: '.agents/skills/omada-ui-kit/',
    globalPath: '~/.gemini/config/skills/omada-ui-kit/',
    cliCommand: 'npx skills add ChenyqThu/omada-ui-kit',
    manualCommand: [
      'pnpm add @chenyqthu/omada-ui-kit',
      'mkdir -p .agents/skills',
      'cp -r node_modules/@chenyqthu/omada-ui-kit/skills/omada-ui-kit .agents/skills/',
    ].join('\n'),
    usageTip:
      'Google Antigravity loads workspace .agents/skills/ and global ~/.gemini/config/skills/ via progressive disclosure whenever you request an Omada PRD demo or React prototype.',
  },
  {
    key: 'other',
    label: 'Copilot / Windsurf / Manual',
    projectPath: '.agents/skills/omada-ui-kit/',
    globalPath: '~/.agents/skills/omada-ui-kit/',
    cliCommand: 'npx skills add ChenyqThu/omada-ui-kit',
    manualCommand: [
      'pnpm add @chenyqthu/omada-ui-kit',
      'mkdir -p .agents/skills',
      'cp -r node_modules/@chenyqthu/omada-ui-kit/skills/omada-ui-kit .agents/skills/',
    ].join('\n'),
    altCommand: [
      'git clone --depth 1 https://github.com/ChenyqThu/omada-ui-kit.git /tmp/omada-ui-kit',
      'mkdir -p .agents/skills',
      'cp -r /tmp/omada-ui-kit/skills/omada-ui-kit .agents/skills/',
    ].join('\n'),
    extraPaths: [
      { agent: 'GitHub Copilot / VS Code', path: '.github/skills/omada-ui-kit/  (~/.copilot/skills/)' },
      { agent: 'Windsurf', path: '.windsurf/skills/omada-ui-kit/  (~/.codeium/windsurf/skills/)' },
      { agent: 'OpenCode', path: '.opencode/skills/omada-ui-kit/  (~/.config/opencode/skills/)' },
    ],
    usageTip:
      'Any coding agent supporting the open SKILL.md specification can auto-load the folder above, or you can point the agent directly at skills/omada-ui-kit/SKILL.md in your prompt.',
  },
];

const SUPPORTED_AGENTS = [
  'Claude Code',
  'Cursor',
  'OpenAI Codex',
  'Google Antigravity',
  'GitHub Copilot',
  'Windsurf',
  'OpenCode',
];

const PROMPT_HTML_DEMO =
  `Using the omada-ui-kit skill (pinned @${PKG_VERSION} CDN), build a single-file HTML PRD prototype for an Omada Controller v6.3 AP Health Monitor using SEmulatorShell, SFilterTableBlock, and SDetailInspectorDrawer. Support Light/Dark mode and run verify-demo.mjs before finishing.`;

const PROMPT_REACT_PAGE =
  'Using the omada-ui-kit skill, create a React page using subpath imports (@chenyqthu/omada-ui-kit/core, /blocks, and /agent). Read references/docs/blocks.md or query query-catalog.mjs first so all props and SIcon slugs are verified.';

const CLI_WORKFLOW_SNIPPET = [
  'node skills/omada-ui-kit/scripts/query-catalog.mjs info',
  'node skills/omada-ui-kit/scripts/query-catalog.mjs list-components blocks',
  'node skills/omada-ui-kit/scripts/query-catalog.mjs template inventory --html > demo.html',
  'node skills/omada-ui-kit/scripts/verify-demo.mjs demo.html',
  'node skills/omada-ui-kit/scripts/verify-demo.mjs --render demo.html # Headless Chrome + axe WCAG audit',
].join('\n');

const SCOPED_MICROFRONTEND_SNIPPET = [
  "import '@chenyqthu/omada-ui-kit/style.scoped.css'; // Zero global CSS preflight reset",
  "import { OmadaProvider, SButton } from '@chenyqthu/omada-ui-kit/core';",
  "import { OmadaAgentProvider } from '@chenyqthu/omada-ui-kit/agent';",
  '// Compact LLM index: import or fetch @chenyqthu/omada-ui-kit/llms.txt',
  '',
  '<OmadaProvider syncDocumentTheme={false} defaultThemeMode="light">',
  '  {/* Exposes window.__OMADA_AGENT__ + registers WebMCP snapshot/query/act tools */}',
  "  <OmadaAgentProvider exposeWindowBridge allow={['demo.wlan.*']}>",
  '    <SButton variant="primary">Apply</SButton>',
  '  </OmadaAgentProvider>',
  '</OmadaProvider>',
].join('\n');

const PSC_CHANNEL_ITEMS: ReadonlyArray<{
  key: string;
  label: string;
  disabled?: boolean;
}> = [
  { key: '37', label: 'Ch 37' },
  { key: '53', label: 'Ch 53' },
  { key: '69', label: 'Ch 69' },
  { key: '85', label: 'Ch 85' },
  { key: '101', label: 'Ch 101' },
  { key: '117', label: 'Ch 117 (AFC)', disabled: true },
];

/**
 * Live demonstration of the 4-Layer Custom Component Authoring Formula:
 * AntD <Popover> shell + headless hooks (useSelection + useDragSelect + useRovingFocus)
 * + var(--omada-*) tokens + useOmadaAgentControl.
 */
const CustomPscChannelPicker: React.FC = () => {
  const selection = useSelection({
    items: PSC_CHANNEL_ITEMS,
    mode: 'multiple',
    defaultSelectedKeys: ['37', '53'],
  });

  const drag = useDragSelect({
    items: PSC_CHANNEL_ITEMS,
    selectedKeys: selection.selectedKeys,
    onSelectionChange: selection.setSelectedKeys,
    strategy: 'paint',
  });

  const roving = useRovingFocus({
    items: PSC_CHANNEL_ITEMS,
    orientation: 'horizontal',
    activationMode: 'manual',
    onActivate: (key) => selection.toggle(key),
  });

  useOmadaAgentControl({
    id: 'demo.wlan.pscChannels',
    kind: 'checkbox',
    label: '6 GHz PSC Channel Matrix (Custom 4-Layer Widget)',
    value: selection.selectedKeys,
    options: PSC_CHANNEL_ITEMS.map((ch) => ({
      value: ch.key,
      label: ch.label,
      disabled: Boolean(ch.disabled),
    })),
    actions: {
      setValue: (next: unknown) =>
        selection.setSelectedKeys(Array.isArray(next) ? next.map(String) : []),
      toggle: (key: unknown) => selection.toggle(String(key)),
      selectAll: () => selection.selectAll(),
      clear: () => selection.clear(),
    },
  });

  return (
    <div className="rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SCheckbox
          checked={selection.isAllSelected}
          indeterminate={selection.isPartiallySelected}
          onChange={() =>
            selection.isAllSelected ? selection.clear() : selection.selectAll()
          }
        >
          <span className="text-xs font-medium">
            Custom 6 GHz PSC Painter ({selection.selectedKeys.length}/5 enabled)
          </span>
        </SCheckbox>
        <Popover
          trigger="click"
          placement="topRight"
          content={
            <div className="max-w-[240px] space-y-1 text-xs text-[var(--omada-text-secondary)]">
              <div className="font-semibold text-[var(--omada-text-primary)]">
                4-Layer Custom Widget
              </div>
              <div>
                Drag-paint across channels, Shift+Click a span, use Arrow keys, or inspect{' '}
                <code className="font-mono">demo.wlan.pscChannels</code> in{' '}
                <code className="font-mono">snapshot()</code>.
              </div>
            </div>
          }
        >
          <SButton size="small" variant="outline">
            4-Layer Info
          </SButton>
        </Popover>
      </div>

      <div
        role="group"
        aria-label="6 GHz PSC Channel Matrix"
        className="flex flex-wrap gap-1.5 select-none"
      >
        {PSC_CHANNEL_ITEMS.map((ch) => {
          const isDisabled = Boolean(ch.disabled);
          const active = selection.isSelected(ch.key);
          const rovingProps = roving.getItemProps<HTMLButtonElement>(ch.key, {
            disabled: isDisabled,
          });
          const dragProps = drag.getDragItemProps<HTMLButtonElement>(ch.key, {
            disabled: isDisabled,
            onClick: (e) => selection.toggle(ch.key, { shiftKey: e.shiftKey }),
          });
          return (
            <button
              key={ch.key}
              type="button"
              disabled={isDisabled}
              aria-pressed={active}
              {...rovingProps}
              {...dragProps}
              className={`h-7 rounded px-2.5 text-xs font-medium cursor-pointer transition-colors ${
                active
                  ? 'border border-[var(--omada-brand)] bg-[var(--omada-brand-bg-subtlest)] text-[var(--omada-brand-text)]'
                  : 'border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] text-[var(--omada-text-primary)] hover:bg-[var(--omada-bg-field-hover)]'
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {ch.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AgentBridgeInspector: React.FC = () => {
  const agent = useOmadaAgent();
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    setOutput(JSON.stringify(agent.snapshot(), null, 2));
  }, [agent]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SButton
          size="small"
          variant="primary"
          onClick={() => setOutput(JSON.stringify(agent.snapshot(), null, 2))}
        >
          snapshot()
        </SButton>
        <SButton
          size="small"
          variant="secondary"
          onClick={() => setOutput(JSON.stringify(agent.query('wlan'), null, 2))}
        >
          {"query('wlan')"}
        </SButton>
        <SButton
          size="small"
          variant="outline"
          onClick={() => {
            const res = agent.act('demo.wlan.enabled', 'toggle');
            setOutput(
              JSON.stringify(
                { actResult: res, snapshot: agent.snapshot() },
                null,
                2,
              ),
            );
          }}
        >
          {"act('demo.wlan.enabled', 'toggle')"}
        </SButton>
        <SButton
          size="small"
          variant="danger"
          onClick={() => {
            const res = agent.act('demo.system.reboot', 'toggle');
            setOutput(JSON.stringify({ actResult: res }, null, 2));
          }}
        >
          {"act('demo.system.reboot', 'toggle')"}
        </SButton>
      </div>
      <pre
        data-testid="agent-bridge-live-output"
        className="m-0 max-h-60 overflow-auto rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] p-3 font-mono text-xs leading-5 text-[var(--omada-text-primary)]"
      >
        <code>{output}</code>
      </pre>
    </div>
  );
};

export const AgentSkillSection: React.FC<AgentSkillSectionProps> = ({ onNavigate }) => {
  const [activeAgentTab, setActiveAgentTab] = useState<string>('claude-code');

  return (
    <div className="space-y-6">
      <SPageHeader
        title="Agent Skill & Issue Feedback"
        description="Install the omada-ui-kit Skill in Claude Code, Cursor, OpenAI Codex, Antigravity, Copilot, or Windsurf — and report missing components or UI issues on GitHub."
        extra={
          <>
            <SButton
              variant="outline"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              icon={<GitBranch size={14} />}
            >
              GitHub Repository
            </SButton>
            <SButton
              variant="primary"
              href={GITHUB_NEW_ISSUE_CHOOSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              icon={<MessageSquarePlus size={14} />}
            >
              Open GitHub Issue
            </SButton>
          </>
        }
      />

      {/* 0. Dual Agent-UI Design Paradigm & Headless Chrome Benchmark */}
      <SCard
        title={`Dual Agent-UI Design Paradigm (v${PKG_VERSION})`}
        subtitle="Built around two verifiable engineering pillars: helping coding agents generate zero-defect pages, and helping browser agents read & operate live pages deterministically."
        extra={<Sparkles size={16} className="text-[var(--omada-brand-text)]" />}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--omada-text-primary)]">
                Pillar 1 · Let Agents Build Pages Better
              </span>
              <STag color="green">-96.3% Context Tokens</STag>
            </div>
            <p className="m-0 text-xs leading-5 text-[var(--omada-text-secondary)]">
              TypeChecker-derived zero-drift catalog, 10 progressive-disclosure domain docs (including{' '}
              <code className="font-mono">custom-component.md</code> + 4 headless hooks in{' '}
              <code className="font-mono">/core</code>), 3.41 MB{' '}
              <code className="font-mono">standalone.js</code>, and{' '}
              <code className="font-mono">verify-demo.mjs --render</code> (Headless Chrome +{' '}
              <code className="font-mono">axe-core</code> WCAG 2.1 A/AA +{' '}
              <code className="font-mono">&lt;||</code> geometry + live Agent Bridge self-check).
            </p>
          </div>

          <div className="rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--omada-text-primary)]">
                Pillar 2 · Let Agents Read & Operate Pages Better
              </span>
              <STag color="blue">-85.7% Calls · 17.8× Faster</STag>
            </div>
            <p className="m-0 text-xs leading-5 text-[var(--omada-text-secondary)]">
              Default <code className="font-mono">&lt;OmadaAgentProvider exposeWindowBridge&gt;</code>{' '}
              across all templates &amp; Controller Emulator, 21 <code className="font-mono">agentId</code>{' '}
              components, standard WebMCP tools (<code className="font-mono">snapshot</code> /{' '}
              <code className="font-mono">query</code> / batch <code className="font-mono">act</code>), and{' '}
              <code className="font-mono">[REDACTED]</code> secret masking — cutting 3-task Chrome PRD flows
              from 42 DOM calls (4,312 ms) to 6 WebMCP calls (243 ms, -53.7% tokens).
            </p>
          </div>
        </div>
      </SCard>

      {/* 1. Quick Install */}
      <SCard
        title="1. Quick Install (Cross-Agent CLI)"
        subtitle="One command installs skills/omada-ui-kit from GitHub and auto-detects your coding agent."
        extra={<Bot size={16} className="text-[var(--omada-brand-text)]" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <CopyCommandBox
              label="Project-Level Install"
              badge="Recommended"
              command="npx skills add ChenyqThu/omada-ui-kit"
            />
            <CopyCommandBox
              label="Global Install (All Projects)"
              badge="Global"
              command="npx skills add ChenyqThu/omada-ui-kit -g"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-[var(--omada-text-secondary)]">
              Supported Agents:
            </span>
            {SUPPORTED_AGENTS.map((agent) => (
              <STag key={agent} color="blue">
                {agent}
              </STag>
            ))}
          </div>
        </div>
      </SCard>

      {/* 2. Agent-Specific Setup & Manual Paths */}
      <SCard
        title="2. Setup by Agent (CLI, npm & Manual Paths)"
        subtitle="Choose your coding agent for exact skill directory paths and offline / manual installation commands."
        extra={<Package size={16} className="text-[var(--omada-brand-text)]" />}
      >
        <STabs
          variant="line"
          activeKey={activeAgentTab}
          onChange={setActiveAgentTab}
          items={AGENT_GUIDES.map((guide) => ({
            key: guide.key,
            label: guide.label,
            children: (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--omada-text-tertiary)]">
                      Project / Workspace Skill Path
                    </div>
                    <code className="mt-1 block font-mono text-xs font-semibold text-[var(--omada-brand-text)]">
                      {guide.projectPath}
                    </code>
                  </div>
                  <div className="rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--omada-text-tertiary)]">
                      Global User Skill Path
                    </div>
                    <code className="mt-1 block font-mono text-xs font-semibold text-[var(--omada-text-primary)]">
                      {guide.globalPath}
                    </code>
                  </div>
                </div>

                {guide.extraPaths && (
                  <div className="rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-3">
                    <div className="mb-2 text-xs font-semibold text-[var(--omada-text-primary)]">
                      Agent-Specific Skill Directories
                    </div>
                    <div className="space-y-1.5">
                      {guide.extraPaths.map((entry) => (
                        <div
                          key={entry.agent}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-medium text-[var(--omada-text-secondary)]">
                            {entry.agent}
                          </span>
                          <code className="font-mono text-[var(--omada-text-primary)]">
                            {entry.path}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <CopyCommandBox
                    label={`${guide.label} CLI Install`}
                    command={guide.cliCommand}
                  />
                  <CopyCommandBox
                    label={`Manual Copy from npm (${guide.label})`}
                    command={guide.manualCommand}
                  />
                </div>

                {guide.altCommand && (
                  <CopyCommandBox
                    label="Manual Install from GitHub Clone (No npm Required)"
                    command={guide.altCommand}
                  />
                )}

                <SAlert
                  type="info"
                  title={`How ${guide.label} uses the skill`}
                  description={guide.usageTip}
                />
              </div>
            ),
          }))}
        />
      </SCard>

      {/* 3. How to Use the Skill (Prompts & Bundled CLI) */}
      <SCard
        title="3. Usage Guide — Progressive Docs & Dual-Engine Verifier"
        subtitle="Load references/llms.txt, references/standalone.md, or domain slices in references/docs/*.md (~96% lower token footprint), 5 HTML/TSX templates, query-catalog.mjs, and Dual-Engine (ts-ast + lexical) verify-demo.mjs."
        extra={<Terminal size={16} className="text-[var(--omada-brand-text)]" />}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--omada-text-secondary)]">
              <Sparkles size={14} className="text-[var(--omada-brand-text)]" />
              <span>Example Prompts</span>
            </div>
            <CopyCommandBox
              label="Single-File HTML PRD Demo"
              badge="Zero Build"
              command={PROMPT_HTML_DEMO}
            />
            <CopyCommandBox
              label="React / Vite App Page"
              badge="ESM Subpaths"
              command={PROMPT_REACT_PAGE}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--omada-text-secondary)]">
              <BookOpen size={14} className="text-[var(--omada-brand-text)]" />
              <span>Bundled Skill CLI Commands</span>
            </div>
            <CopyCommandBox
              label="Catalog Lookup & Demo Verifier"
              command={CLI_WORKFLOW_SNIPPET}
            />
            <p className="m-0 text-xs leading-5 text-[var(--omada-text-secondary)]">
              If your agent installed the skill into{' '}
              <code className="font-mono">.claude/skills/omada-ui-kit/</code>,{' '}
              <code className="font-mono">.cursor/skills/omada-ui-kit/</code>, or{' '}
              <code className="font-mono">.agents/skills/omada-ui-kit/</code>, swap{' '}
              <code className="font-mono">skills/omada-ui-kit/</code> for that directory path.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SButton
                size="small"
                variant="outline"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('blocks');
                  } else if (typeof window !== 'undefined') {
                    window.location.hash = '#/showcase/blocks';
                  }
                }}
              >
                Browse Blocks
              </SButton>
              <SButton
                size="small"
                variant="secondary"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('templates');
                  } else if (typeof window !== 'undefined') {
                    window.location.hash = '#/showcase/templates';
                  }
                }}
              >
                Browse Page Templates
              </SButton>
            </div>
          </div>
        </div>
      </SCard>

      {/* 4. Live Agent Bridge, WebMCP & Scoped Micro-Frontend CSS */}
      <SCard
        title="4. Live Agent Bridge, WebMCP & Scoped Micro-Frontend CSS"
        subtitle="Deterministic snapshot(), query(), batch act({ steps }), WebMCP document.modelContext tool registration, allow policy enforcement & [REDACTED] secret masking via @chenyqthu/omada-ui-kit/agent."
        extra={<Layers size={16} className="text-[var(--omada-brand-text)]" />}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <CopyCommandBox
              label="Scoped Micro-Frontend CSS + Agent Bridge / WebMCP"
              badge="No Global Reset"
              command={SCOPED_MICROFRONTEND_SNIPPET}
            />
            <SAlert
              type="info"
              title="Security, WebMCP & Isolation Guarantees"
              description="SPasswordInput masks values as [REDACTED]; exposeWindowBridge publishes window.__OMADA_AGENT__ and WebMCP tools (snapshot, query, act); allow={['demo.wlan.*']} blocks demo.system.reboot; style.scoped.css isolates tokens inside .omada-scope."
            />
          </div>

          <div className="rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-4">
            <OmadaAgentProvider allow={['demo.wlan.*']}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SSwitch
                    agentId="demo.wlan.enabled"
                    label="Enable Guest 6 GHz SSID"
                    defaultChecked
                  />
                  <SSwitch
                    agentId="demo.system.reboot"
                    label="Scheduled Reboot (Blocked by allow)"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <div className="mb-1 text-xs font-medium text-[var(--omada-text-secondary)]">
                      Guest SSID Name
                    </div>
                    <SInput
                      agentId="demo.wlan.ssid"
                      aria-label="Guest SSID Name"
                      defaultValue="Omada-Guest-6G"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-medium text-[var(--omada-text-secondary)]">
                      WPA3 Passphrase (Masked)
                    </div>
                    <SPasswordInput
                      agentId="demo.wlan.psk"
                      aria-label="WPA3 Passphrase"
                      defaultValue="OmadaWPA3!2026"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-medium text-[var(--omada-text-secondary)]">
                      Band Steering
                    </div>
                    <SSelect
                      agentId="demo.wlan.band"
                      aria-label="Band Steering"
                      defaultValue="auto"
                      className="w-full"
                      options={[
                        { value: 'auto', label: 'Balanced (2.4G / 5G / 6G)' },
                        { value: '6g', label: 'Prefer 6 GHz' },
                      ]}
                    />
                  </div>
                </div>
                <CustomPscChannelPicker />
                <AgentBridgeInspector />
              </div>
            </OmadaAgentProvider>
          </div>
        </div>
      </SCard>

      {/* 5. Missing Components & UI Issue Feedback */}
      <SCard
        title="5. Missing UI Components or Specific Component Issues?"
        subtitle="Found a missing Omada Controller v6.3 component, icon, or visual/behavior bug? Open a structured GitHub Issue so it can be added or fixed quickly."
        extra={<MessageSquarePlus size={16} className="text-[var(--omada-brand-text)]" />}
      >
        <div className="space-y-4">
          <SAlert
            type="info"
            title="What helps us ship missing components & fixes fastest"
            description="Include the Omada Controller v6.3 page/module name, whether you are using Single-File HTML (CDN standalone.js) or React ESM, Light/Dark theme mode, and any screenshots or Figma references."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between gap-4 rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--omada-text-primary)]">
                  <Puzzle size={16} className="text-[var(--omada-brand-text)]" />
                  <span>Request Missing Component / Asset</span>
                </div>
                <p className="m-0 text-xs leading-5 text-[var(--omada-text-secondary)]">
                  Need a missing S* primitive, reusable block, Controller v6.3 widget, page
                  template, or Figma icon/product photo slug? File a structured component request.
                </p>
              </div>
              <div>
                <SButton
                  variant="primary"
                  href={GITHUB_MISSING_COMPONENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<ExternalLink size={14} />}
                  data-testid="request-component-issue-link"
                >
                  Request Missing Component
                </SButton>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-page)] p-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--omada-text-primary)]">
                  <Bug size={16} className="text-[var(--omada-color-warning)]" />
                  <span>Report UI Bug / Visual Issue</span>
                </div>
                <p className="m-0 text-xs leading-5 text-[var(--omada-text-secondary)]">
                  Spotted layout overlap, broken Dark/Light mode tokens, missing props, or
                  TypeScript errors on an existing component? Submit a bug report directly.
                </p>
              </div>
              <div>
                <SButton
                  variant="outline"
                  href={GITHUB_BUG_REPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<ExternalLink size={14} />}
                  data-testid="report-bug-issue-link"
                >
                  Report UI Bug
                </SButton>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--omada-border-divider)] pt-3 text-xs text-[var(--omada-text-secondary)]">
            <span>Track open component requests and bug fixes on GitHub.</span>
            <a
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[var(--omada-brand-text)] no-underline hover:underline"
            >
              <span>Browse existing GitHub Issues</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </SCard>
    </div>
  );
};
