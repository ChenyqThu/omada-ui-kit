import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const LIB_STYLE_IMPORTS = [
  '../styles/manrope-latin.css',
  '../styles/tokens.css',
  '../styles/omada-antd-overrides.css',
  '../styles/modules/nav-shell.css',
  '../styles/modules/select-inputs.css',
  '../styles/modules/time-schedule.css',
  '../styles/modules/data-charts.css',
  '../styles/modules/feedback-overlays.css',
  '../styles/modules/emulator-shell.css',
  '../styles/modules/emulator-dashboard.css',
  '../styles/modules/emulator-devices.css',
  '../styles/modules/emulator-drawer.css',
  '../styles/modules/emulator-clients.css',
  '../styles/modules/emulator-map.css',
  '../styles/modules/emulator-insights.css',
  '../styles/modules/emulator-incidents.css',
  '../styles/modules/emulator-logs-recover.css',
  '../styles/modules/emulator-config-core.css',
  '../styles/modules/emulator-config-wlan-acl.css',
  '../styles/modules/emulator-dev-config.css',
  '../styles/modules/emulator-hotspot.css',
  '../styles/modules/emulator-tools-maint.css',
  '../styles/modules/blocks.css',
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
      entry: {
        index: path.resolve(import.meta.dirname, 'src/lib/index.ts'),
        core: path.resolve(import.meta.dirname, 'src/lib/core.ts'),
        blocks: path.resolve(import.meta.dirname, 'src/lib/blocks.ts'),
        charts: path.resolve(import.meta.dirname, 'src/lib/charts.ts'),
        emulator: path.resolve(import.meta.dirname, 'src/lib/emulator.ts'),
        assets: path.resolve(import.meta.dirname, 'src/lib/assets.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
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
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
        codeSplitting: {
          groups: [
            {
              name: 'builtin-illustrations',
              priority: 30,
              test: /src\/(omada\/(assets\/builtinIllustrations|components\/SEmpty)|assets\/illustrations\/(light|dark)\/(no-data|upgrade)\.svg)/,
            },
            {
              name: 'asset-manifests',
              priority: 30,
              test: /src\/omada\/assets\/(ThemedAssetImage|assetsManifest)/,
            },
            {
              name: 'asset-icons',
              priority: 20,
              test: /src\/(omada\/assets\/(SIcon|iconsManifest)|assets\/icons)\/?/,
            },
            {
              name: 'asset-illustrations',
              priority: 20,
              test: /src\/(omada\/assets\/SIllustration|assets\/illustrations)\/?/,
            },
            {
              name: 'asset-products',
              priority: 20,
              test: /src\/(omada\/assets\/SProductImage|assets\/products)\/?/,
            },
            {
              name: 'asset-clients',
              priority: 20,
              test: /src\/(omada\/assets\/SClientIcon|assets\/clients)\/?/,
            },
            {
              name: 'asset-brand',
              priority: 20,
              test: /src\/(omada\/assets\/SBrandAsset|assets\/brand)\/?/,
            },
            {
              name: 'echarts-charts',
              priority: 20,
              test: /src\/omada\/components\/(SChart|SDonutSummaryCard)/,
            },
          ],
        },
      },
    },
  },
});
