import React from 'react';
import { OmadaProvider } from '@/omada';
import { ShowcaseApp } from './showcase/ShowcaseApp';

export const App: React.FC = () => {
  return (
    <OmadaProvider defaultThemeMode="light">
      <ShowcaseApp />
    </OmadaProvider>
  );
};

export default App;
