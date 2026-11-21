import React, { useEffect, useState } from 'react';
import { OmadaProvider } from '@/omada';
import { EmulatorApp } from './demos/emulator/EmulatorApp';
import { ShowcaseApp } from './showcase/ShowcaseApp';

function isShowcaseRoute(hash: string): boolean {
  const cleaned = hash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  return cleaned === 'showcase' || cleaned.startsWith('showcase/');
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
      {isShowcaseRoute(hash) ? <ShowcaseApp /> : <EmulatorApp />}
    </OmadaProvider>
  );
};

export default App;
