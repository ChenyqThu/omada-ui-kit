import React, { useEffect, useState } from 'react';
import { OmadaProvider } from '@/omada';

const EmulatorApp = React.lazy(() =>
  import('./demos/emulator/EmulatorApp').then((m) => ({ default: m.EmulatorApp })),
);
const HotspotPortalApp = React.lazy(() =>
  import('./demos/emulator/hotspot/HotspotPortalApp').then((m) => ({
    default: m.HotspotPortalApp,
  })),
);
const ShowcaseApp = React.lazy(() =>
  import('./showcase/ShowcaseApp').then((m) => ({ default: m.ShowcaseApp })),
);

function isShowcaseRoute(hash: string): boolean {
  const cleaned = hash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  return cleaned === 'showcase' || cleaned.startsWith('showcase/');
}

function isHotspotRoute(hash: string): boolean {
  const cleaned = hash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  return cleaned === 'hotspot' || cleaned.startsWith('hotspot/');
}

export const App: React.FC = () => {
  const [hash, setHash] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.hash : '',
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <OmadaProvider defaultThemeMode="light">
      <React.Suspense
        fallback={
          <div className="flex h-screen items-center justify-center text-sm text-[var(--omada-text-secondary)]">
            Loading Omada UI Kit…
          </div>
        }
      >
        {isShowcaseRoute(hash) ? (
          <ShowcaseApp />
        ) : isHotspotRoute(hash) ? (
          <HotspotPortalApp
            onBackToController={() => {
              if (typeof window !== 'undefined') {
                window.location.hash = '#/dashboard';
              }
              setHash('#/dashboard');
            }}
          />
        ) : (
          <EmulatorApp />
        )}
      </React.Suspense>
    </OmadaProvider>
  );
};

export default App;
