import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const LIB_STYLE_IMPORTS = [
  "@fontsource/manrope/400.css",
  "@fontsource/manrope/500.css",
  "@fontsource/manrope/600.css",
  "@fontsource/manrope/700.css",
  "../styles/tokens.css",
  "../styles/omada-antd-overrides.css",
  "../styles/modules/nav-shell.css",
  "../styles/modules/select-inputs.css",
  "../styles/modules/time-schedule.css",
  "../styles/modules/data-charts.css",
  "../styles/modules/feedback-overlays.css",
  "../styles/modules/emulator-shell.css",
  "../styles/modules/emulator-dashboard.css",
  "../styles/modules/emulator-devices.css",
  "../styles/modules/emulator-drawer.css",
  "../styles/modules/emulator-clients.css",
  "../styles/modules/emulator-map.css",
  "../styles/modules/emulator-insights.css",
  "../styles/modules/emulator-incidents.css",
  "../styles/modules/emulator-logs-recover.css",
  "../styles/modules/emulator-config-core.css",
  "../styles/modules/emulator-config-wlan-acl.css",
  "../styles/modules/emulator-dev-config.css",
  "../styles/modules/emulator-hotspot.css",
  "../styles/modules/emulator-tools-maint.css",
  "../styles/modules/blocks.css",
];

function injectLibStyleImports(): Plugin {
  const entryPath = path.resolve(import.meta.dirname, 'src/lib/index.ts').replace(/\\/g, '/');
  const preamble = LIB_STYLE_IMPORTS.map((spec) => `import '${spec}';`).join('\n');
  return {
    name: 'omada-inject-lib-styles',
    enforce: 'pre',
    transform(code, id) {
      if (id.replace(/\\/g, '/') === entryPath) {
        return { code: `${preamble}\n${code}`, map: null };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [injectLibStyleImports(), react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/lib/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'antd',
        '@ant-design/icons',
        '@ant-design/cssinjs',
        'echarts',
        'lucide-react',
        /^antd\//,
        /^@ant-design\//,
        /^echarts\//,
        /^lucide-react\//,
        /^react\//,
        /^react-dom\//,
      ],
    },
  },
});
