import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import './styles/tokens.css';
import './styles/omada-antd-overrides.css';
import './styles/modules/nav-shell.css';
import './styles/modules/select-inputs.css';
import './styles/modules/time-schedule.css';
import './styles/modules/data-charts.css';
import './styles/modules/feedback-overlays.css';
import './styles/modules/emulator-shell.css';
import './styles/modules/emulator-dashboard.css';
import './styles/modules/emulator-devices.css';
import './styles/modules/emulator-drawer.css';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
