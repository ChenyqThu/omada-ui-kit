import React, { useState } from 'react';
import {
  BarChart3,
  BellRing,
  FormInput,
  Images,
  Palette,
  Server,
} from 'lucide-react';
import { SAppShell, useOmadaFeedback, type SNavGroup } from '@/omada';
import { DeviceListDemo } from './demos/DeviceListDemo';
import { AssetsSection } from './sections/AssetsSection';
import { DataDisplaySection } from './sections/DataDisplaySection';
import { FeedbackSection } from './sections/FeedbackSection';
import { InputsSection } from './sections/InputsSection';
import { TokensSection } from './sections/TokensSection';

type ShowcaseRoute =
  | 'devices-demo'
  | 'tokens'
  | 'assets'
  | 'inputs'
  | 'display'
  | 'feedback';

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
        key: 'inputs',
        label: 'Inputs & Forms',
        icon: <FormInput size={16} />,
      },
      {
        key: 'display',
        label: 'Data Display & Charts',
        icon: <BarChart3 size={16} />,
      },
      {
        key: 'feedback',
        label: 'Feedback & Overlays',
        icon: <BellRing size={16} />,
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
      onNotificationClick={() =>
        toast.info('3 unread site events: 1 firmware alert, 2 adoption updates')
      }
    >
      {activeKey === 'devices-demo' && <DeviceListDemo />}
      {activeKey === 'tokens' && <TokensSection />}
      {activeKey === 'assets' && <AssetsSection />}
      {activeKey === 'inputs' && <InputsSection />}
      {activeKey === 'display' && <DataDisplaySection />}
      {activeKey === 'feedback' && <FeedbackSection />}
    </SAppShell>
  );
};
