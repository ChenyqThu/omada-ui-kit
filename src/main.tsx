import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/manrope-latin.css';
import './styles/tokens.css';
import './styles/omada-antd-overrides.css';
import './styles/modules/nav-shell.css';
import './styles/modules/select-inputs.css';
import './styles/modules/time-schedule.css';
import './styles/modules/data-charts.css';
import './styles/modules/feedback-overlays.css';
import './styles/modules/emulator-shell.css';
import './styles/modules/emulator-components.css';
import './styles/modules/blocks.css';
import './demos/emulator/emulator-pages.css';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
