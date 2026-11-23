import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  BellRing,
  Blocks,
  Bot,
  CalendarClock,
  Compass,
  FileCode2,
  FormInput,
  Images,
  Layers,
  LayoutGrid,
  MessageSquarePlus,
  Palette,
  Server,
  SlidersHorizontal,
} from 'lucide-react';
import { SAppShell, useOmadaFeedback, type SNavGroup } from '@/omada';
import { BlocksSection } from './sections/BlocksSection';

const AgentSkillSection = React.lazy(() =>
  import('./sections/AgentSkillSection').then((m) => ({ default: m.AgentSkillSection })),
);

const DeviceListDemo = React.lazy(() =>
  import('./demos/DeviceListDemo').then((m) => ({ default: m.DeviceListDemo })),
);
const AssetsSection = React.lazy(() =>
  import('./sections/AssetsSection').then((m) => ({ default: m.AssetsSection })),
);
const DataChartsSection = React.lazy(() =>
  import('./sections/DataChartsSection').then((m) => ({ default: m.DataChartsSection })),
);
const DataDisplaySection = React.lazy(() =>
  import('./sections/DataDisplaySection').then((m) => ({ default: m.DataDisplaySection })),
);
const FeedbackOverlaysSection = React.lazy(() =>
  import('./sections/FeedbackOverlaysSection').then((m) => ({
    default: m.FeedbackOverlaysSection,
  })),
);
const FeedbackSection = React.lazy(() =>
  import('./sections/FeedbackSection').then((m) => ({ default: m.FeedbackSection })),
);
const InputsSection = React.lazy(() =>
  import('./sections/InputsSection').then((m) => ({ default: m.InputsSection })),
);
const NavShellSection = React.lazy(() =>
  import('./sections/NavShellSection').then((m) => ({ default: m.NavShellSection })),
);
const SelectInputsSection = React.lazy(() =>
  import('./sections/SelectInputsSection').then((m) => ({ default: m.SelectInputsSection })),
);
const TemplatesSection = React.lazy(() =>
  import('./sections/TemplatesSection').then((m) => ({ default: m.TemplatesSection })),
);
const TimeScheduleSection = React.lazy(() =>
  import('./sections/TimeScheduleSection').then((m) => ({ default: m.TimeScheduleSection })),
);
const TokensSection = React.lazy(() =>
  import('./sections/TokensSection').then((m) => ({ default: m.TokensSection })),
);

type ShowcaseRoute =
  | 'agent-skill'
  | 'blocks'
  | 'templates'
  | 'devices-demo'
  | 'tokens'
  | 'assets'
  | 'nav-shell'
  | 'inputs'
  | 'select-inputs'
  | 'time-schedule'
  | 'display'
  | 'data-charts'
  | 'feedback'
  | 'feedback-overlays';

const VALID_ROUTES = new Set<string>([
  'agent-skill',
  'blocks',
  'templates',
  'devices-demo',
  'tokens',
  'assets',
  'nav-shell',
  'inputs',
  'select-inputs',
  'time-schedule',
  'display',
  'data-charts',
  'feedback',
  'feedback-overlays',
]);

function parseShowcaseSubroute(): ShowcaseRoute {
  if (typeof window === 'undefined') return 'blocks';
  const cleaned = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (cleaned.startsWith('showcase/')) {
    const sub = cleaned.slice('showcase/'.length);
    if (sub === 'skill' || sub === 'getting-started') {
      return 'agent-skill';
    }
    if (VALID_ROUTES.has(sub)) {
      return sub as ShowcaseRoute;
    }
  }
  return 'blocks';
}

const NAV_GROUPS: SNavGroup[] = [
  {
    key: 'getting-started',
    label: 'Getting Started',
    items: [
      {
        key: 'agent-skill',
        label: 'Agent Skill & Issues',
        icon: <Bot size={16} />,
        badge: 'AI',
      },
    ],
  },
  {
    key: 'blocks-templates',
    label: 'Blocks & Templates',
    items: [
      {
        key: 'blocks',
        label: 'Blocks',
        icon: <Blocks size={16} />,
        badge: '6',
      },
      {
        key: 'templates',
        label: 'Page Templates',
        icon: <FileCode2 size={16} />,
        badge: '5',
      },
      {
        key: 'devices-demo',
        label: 'Devices Demo',
        icon: <Server size={16} />,
        badge: 'Live',
      },
    ],
  },
  {
    key: 'library',
    label: 'Component Library',
    items: [
      {
        key: 'tokens',
        label: 'Design Tokens',
        icon: <Palette size={16} />,
      },
      {
        key: 'assets',
        label: 'Icons & Assets',
        icon: <Images size={16} />,
        badge: '859',
      },
      {
        key: 'nav-shell',
        label: 'Navigation & Shell',
        icon: <Compass size={16} />,
      },
      {
        key: 'inputs',
        label: 'Inputs & Forms',
        icon: <FormInput size={16} />,
      },
      {
        key: 'select-inputs',
        label: 'Select, Toggles & Sliders',
        icon: <SlidersHorizontal size={16} />,
      },
      {
        key: 'time-schedule',
        label: 'Time & Schedule',
        icon: <CalendarClock size={16} />,
      },
      {
        key: 'display',
        label: 'Data Display & Charts',
        icon: <BarChart3 size={16} />,
      },
      {
        key: 'data-charts',
        label: 'Advanced Table & Tiles',
        icon: <LayoutGrid size={16} />,
      },
      {
        key: 'feedback',
        label: 'Feedback & Overlays',
        icon: <BellRing size={16} />,
      },
      {
        key: 'feedback-overlays',
        label: 'Overlays, Progress & Mask',
        icon: <Layers size={16} />,
      },
    ],
  },
];

export const ShowcaseApp: React.FC = () => {
  const [activeKey, setActiveKey] = useState<ShowcaseRoute>(() => parseShowcaseSubroute());
  const [activeSite, setActiveSite] = useState<string>('hq');
  const { toast } = useOmadaFeedback();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => setActiveKey(parseShowcaseSubroute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleSelect = (key: string) => {
    const next = VALID_ROUTES.has(key) ? (key as ShowcaseRoute) : 'blocks';
    setActiveKey(next);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/showcase/${next}`;
    }
  };

  return (
    <SAppShell
      navGroups={NAV_GROUPS}
      activeKey={activeKey}
      onSelect={handleSelect}
      activeSite={activeSite}
      onSiteChange={(site) => {
        setActiveSite(site);
        toast.info(`Switched active site context to "${site.toUpperCase()}"`);
      }}
      topBarExtra={
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/ChenyqThu/omada-ui-kit/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="showcase-report-issue-link"
            className="inline-flex h-8 items-center gap-1.5 rounded bg-white/15 px-2.5 text-xs font-medium text-white no-underline transition-colors hover:bg-white/25"
          >
            <MessageSquarePlus size={13} />
            <span>Report Issue</span>
          </a>
          <a
            href="#/dashboard"
            data-testid="back-to-emulator-link"
            className="inline-flex h-8 items-center gap-1 rounded bg-white/15 px-2.5 text-xs font-medium text-white no-underline transition-colors hover:bg-white/25"
          >
            ← Omada Emulator
          </a>
        </div>
      }
      onNotificationClick={() =>
        toast.info('3 unread site events: 1 firmware alert, 2 adoption updates')
      }
    >
      <React.Suspense
        fallback={
          <div className="p-8 text-sm text-[var(--omada-text-secondary)]">
            Loading section…
          </div>
        }
      >
        {activeKey === 'agent-skill' && <AgentSkillSection onNavigate={handleSelect} />}
        {activeKey === 'blocks' && <BlocksSection />}
        {activeKey === 'templates' && <TemplatesSection />}
        {activeKey === 'devices-demo' && <DeviceListDemo />}
        {activeKey === 'tokens' && <TokensSection />}
        {activeKey === 'assets' && <AssetsSection />}
        {activeKey === 'nav-shell' && <NavShellSection />}
        {activeKey === 'inputs' && <InputsSection />}
        {activeKey === 'select-inputs' && <SelectInputsSection />}
        {activeKey === 'time-schedule' && <TimeScheduleSection />}
        {activeKey === 'display' && <DataDisplaySection />}
        {activeKey === 'data-charts' && <DataChartsSection />}
        {activeKey === 'feedback' && <FeedbackSection />}
        {activeKey === 'feedback-overlays' && <FeedbackOverlaysSection />}
      </React.Suspense>

      <footer
        data-testid="showcase-feedback-footer"
        className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--omada-border-divider)] bg-[var(--omada-bg-surface)] px-4 py-3 text-xs text-[var(--omada-text-secondary)]"
      >
        <span>
          Missing a UI component or spotted a layout/theme bug? Submit a structured GitHub Issue so
          it can be added or fixed.
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {activeKey !== 'agent-skill' && (
            <button
              type="button"
              onClick={() => handleSelect('agent-skill')}
              className="cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-[var(--omada-brand-text)] hover:underline"
            >
              Agent Skill Setup
            </button>
          )}
          <a
            href="https://github.com/ChenyqThu/omada-ui-kit/issues/new?template=missing-component.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--omada-brand-text)] no-underline hover:underline"
          >
            Request Missing Component
          </a>
          <a
            href="https://github.com/ChenyqThu/omada-ui-kit/issues/new?template=component-bug.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--omada-text-primary)] no-underline hover:underline"
          >
            Report UI Issue
          </a>
        </div>
      </footer>
    </SAppShell>
  );
};
