import React, { useState } from 'react';
import { Check, Code2, Copy } from 'lucide-react';
import {
  SButton,
  SCard,
  SModal,
  SPageHeader,
  STabs,
  STag,
  useOmadaFeedback,
} from '@/omada';
import dashboardHtml from '../../../templates/dashboard.html?raw';
import dashboardTsx from '../../../templates/dashboard.tsx?raw';
import inventoryHtml from '../../../templates/inventory.html?raw';
import inventoryTsx from '../../../templates/inventory.tsx?raw';
import aclRulesHtml from '../../../templates/acl-rules.html?raw';
import aclRulesTsx from '../../../templates/acl-rules.tsx?raw';
import settingsHtml from '../../../templates/settings.html?raw';
import settingsTsx from '../../../templates/settings.tsx?raw';
import analyticsHtml from '../../../templates/analytics-logs.html?raw';
import analyticsTsx from '../../../templates/analytics-logs.tsx?raw';

interface TemplateItem {
  id: string;
  title: string;
  summary: string;
  blocks: string[];
  cliCommand: string;
  html: string;
  tsx: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'dashboard',
    title: 'Site Overview Dashboard',
    summary: 'Complete Omada homepage combining top KPI tiles, 180-degree Health Gauge, 24h Trend Bar, WAN Line Chart, and Channel Utilization.',
    blocks: ['SEmulatorShell', 'SHealthGauge', 'SHealthTrendBar', 'SLineChart', 'SChannelUtilization'],
    cliCommand: 'node skills/omada-ui-kit/scripts/query-catalog.mjs template dashboard --html',
    html: dashboardHtml,
    tsx: dashboardTsx,
  },
  {
    id: 'inventory',
    title: 'Devices Inventory + 2-Stage Drawer',
    summary: 'Searchable & status-filtered device list powered by SFilterTableBlock and expandable 420px/1040px SDetailInspectorDrawer.',
    blocks: ['SEmulatorShell', 'SFilterTableBlock', 'SDetailInspectorDrawer', 'SProductImage'],
    cliCommand: 'node skills/omada-ui-kit/scripts/query-catalog.mjs template inventory --html',
    html: inventoryHtml,
    tsx: inventoryTsx,
  },
  {
    id: 'acl-rules',
    title: 'ACL Policy List + Inline Rule Builder',
    summary: 'Tabbed rule table transitioning inline into SInlineRuleEditorLayout and the Source -> Destination SAclRuleBuilder.',
    blocks: ['SEmulatorShell', 'SFilterTableBlock', 'SInlineRuleEditorLayout', 'SAclRuleBuilder'],
    cliCommand: 'node skills/omada-ui-kit/scripts/query-catalog.mjs template acl-rules --html',
    html: aclRulesHtml,
    tsx: aclRulesTsx,
  },
  {
    id: 'settings',
    title: 'Multi-Tab Network Settings Form',
    summary: 'Settings workspace using SSettingsPageShell sticky Apply/Cancel bar, SSettingsInfoBanner, SIpInput, and SExpandableSection.',
    blocks: ['SEmulatorShell', 'SSettingsPageShell', 'SExpandableSection', 'SIpInput'],
    cliCommand: 'node skills/omada-ui-kit/scripts/query-catalog.mjs template settings --html',
    html: settingsHtml,
    tsx: settingsTsx,
  },
  {
    id: 'analytics-logs',
    title: 'Incident & Event Analytics',
    summary: 'SCategoryKpiCarousel category selector, Severity Donut breakdown card, and searchable live event timeline.',
    blocks: ['SEmulatorShell', 'SCategoryKpiCarousel', 'SDonutSummaryCard', 'SFilterTableBlock'],
    cliCommand: 'node skills/omada-ui-kit/scripts/query-catalog.mjs template analytics-logs --html',
    html: analyticsHtml,
    tsx: analyticsTsx,
  },
];

export const TemplatesSection: React.FC = () => {
  const { toast } = useOmadaFeedback();
  const [inspecting, setInspecting] = useState<TemplateItem | null>(null);
  const [codeTab, setCodeTab] = useState<'html' | 'tsx'>('html');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySource = async (id: string, label: string, content: string) => {
    try {
      await navigator.clipboard?.writeText(content);
      setCopiedId(id);
      toast.success(`Copied ${label}`);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.info(`Prepared ${label}`);
    }
  };

  return (
    <div className="space-y-6">
      <SPageHeader
        title="Full-Page Starter Templates"
        description="Ready-to-run Single-File HTML (CDN zero-build) & React TSX page templates derived directly from templates/."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {TEMPLATES.map((tpl) => (
          <SCard
            key={tpl.id}
            title={tpl.title}
            subtitle={tpl.cliCommand}
            extra={
              <SButton
                size="small"
                variant="outline"
                icon={<Code2 size={13} />}
                onClick={() => {
                  setInspecting(tpl);
                  setCodeTab('html');
                }}
              >
                View Code
              </SButton>
            }
          >
            <p className="mt-0 mb-3 text-sm leading-5 text-[var(--omada-text-secondary)]">
              {tpl.summary}
            </p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {tpl.blocks.map((blockName) => (
                <STag key={blockName} color="green">
                  {blockName}
                </STag>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SButton
                size="small"
                variant="primary"
                icon={
                  copiedId === `${tpl.id}-html` ? <Check size={13} /> : <Copy size={13} />
                }
                onClick={() => copySource(`${tpl.id}-html`, `${tpl.id}.html`, tpl.html)}
              >
                Copy Single-File HTML
              </SButton>
              <SButton
                size="small"
                variant="secondary"
                icon={
                  copiedId === `${tpl.id}-tsx` ? <Check size={13} /> : <Copy size={13} />
                }
                onClick={() => copySource(`${tpl.id}-tsx`, `${tpl.id}.tsx`, tpl.tsx)}
              >
                Copy TSX
              </SButton>
            </div>
          </SCard>
        ))}
      </div>

      <SModal
        size="xl"
        open={Boolean(inspecting)}
        title={inspecting ? `Template Source: ${inspecting.title}` : ''}
        onCancel={() => setInspecting(null)}
        onOk={() =>
          inspecting &&
          copySource(
            `${inspecting.id}-modal`,
            `${inspecting.id}.${codeTab}`,
            codeTab === 'html' ? inspecting.html : inspecting.tsx,
          )
        }
        okText={`Copy ${codeTab.toUpperCase()}`}
        cancelText="Close"
        destroyOnHidden
      >
        {inspecting && (
          <div className="space-y-3">
            <STabs
              activeKey={codeTab}
              onChange={(key) => setCodeTab(key as 'html' | 'tsx')}
              items={[
                { key: 'html', label: `Single-File HTML (${inspecting.id}.html)` },
                { key: 'tsx', label: `React TSX (${inspecting.id}.tsx)` },
              ]}
            />
            <pre className="max-h-[460px] overflow-auto rounded-md border border-[var(--omada-border-divider)] bg-[var(--omada-bg-field)] p-4 font-mono text-xs leading-5 text-[var(--omada-text-primary)]">
              <code>{codeTab === 'html' ? inspecting.html : inspecting.tsx}</code>
            </pre>
          </div>
        )}
      </SModal>
    </div>
  );
};
