import React, { useState } from 'react';
import {
  BarChart3,
  BellRing,
  CalendarClock,
  Compass,
  FormInput,
  Images,
  Layers,
  LayoutGrid,
  Palette,
  Server,
  SlidersHorizontal,
} from 'lucide-react';
import { SAppShell, useOmadaFeedback, type SNavGroup } from '@/omada';
import { DeviceListDemo } from './demos/DeviceListDemo';
import { AssetsSection } from './sections/AssetsSection';
import { DataChartsSection } from './sections/DataChartsSection';
import { DataDisplaySection } from './sections/DataDisplaySection';
import { FeedbackOverlaysSection } from './sections/FeedbackOverlaysSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { InputsSection } from './sections/InputsSection';
import { NavShellSection } from './sections/NavShellSection';
import { SelectInputsSection } from './sections/SelectInputsSection';
import { TimeScheduleSection } from './sections/TimeScheduleSection';
import { TokensSection } from './sections/TokensSection';

type ShowcaseRoute =
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

const NAV_GROUPS: SNavGroup[] = [
  {
    key: 'demos',
    label: 'Demo Workspace',
    items: [
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
        badge: '998',
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
  const [activeKey, setActiveKey] = useState<ShowcaseRoute>('devices-demo');
  const [activeSite, setActiveSite] = useState<string>('hq');
  const { toast } = useOmadaFeedback();

  return (
    <SAppShell
      navGroups={NAV_GROUPS}
      activeKey={activeKey}
      onSelect={(key) => setActiveKey(key as ShowcaseRoute)}
      activeSite={activeSite}
      onSiteChange={(site) => {
        setActiveSite(site);
        toast.info(`Switched active site context to "${site.toUpperCase()}"`);
      }}
      topBarExtra={
        <a
          href="#/dashboard"
          data-testid="back-to-emulator-link"
          className="inline-flex h-8 items-center gap-1 rounded bg-white/15 px-2.5 text-xs font-medium text-white no-underline transition-colors hover:bg-white/25"
        >
          ← Omada Emulator
        </a>
      }
      onNotificationClick={() =>
        toast.info('3 unread site events: 1 firmware alert, 2 adoption updates')
      }
    >
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
    </SAppShell>
  );
};
