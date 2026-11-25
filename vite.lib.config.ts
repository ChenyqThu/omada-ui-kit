import fs from 'node:fs';
import path from 'node:path';
import { build as viteBuild, defineConfig, type Plugin } from 'vite';
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
  '../styles/modules/emulator-components.css',
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

function wrapComponentLayerInScope(cssCode: string): string {
  const marker = '@layer components {';
  const startIdx = cssCode.indexOf(marker);
  const lastBrace = cssCode.lastIndexOf('}');
  if (startIdx === -1 || lastBrace <= startIdx) {
    return cssCode;
  }
  const before = cssCode.slice(0, startIdx + marker.length);
  const body = cssCode.slice(startIdx + marker.length, lastBrace);
  const after = cssCode.slice(lastBrace);
  return `${before}\n  :where(.omada-scope, .omada-emulator-root) {${body}\n  }\n${after}`;
}

function buildScopedStylesheetPlugin(): Plugin {
  let ran = false;
  return {
    name: 'omada-build-scoped-css',
    apply: 'build',
    async closeBundle() {
      if (ran) return;
      ran = true;
      const tmpDir = path.resolve(import.meta.dirname, 'node_modules/.tmp/scoped-css-build');
      const tmpCssDir = path.join(tmpDir, 'wrapped-css');
      const virtualEntryId = 'virtual:omada-scoped-style-entry.js';
      const resolvedVirtualId = `\0${virtualEntryId}`;
      const stylesRoot = path.resolve(import.meta.dirname, 'src/styles').replace(/\\/g, '/');
      fs.rmSync(tmpDir, { recursive: true, force: true });
      fs.mkdirSync(tmpCssDir, { recursive: true });

      const wrappedFiles = [
        'omada-antd-overrides.css',
        'modules/nav-shell.css',
        'modules/select-inputs.css',
        'modules/time-schedule.css',
        'modules/data-charts.css',
        'modules/feedback-overlays.css',
        'modules/emulator-components.css',
        'modules/blocks.css',
      ];
      const entryImports = [
        `${stylesRoot}/manrope-latin.css`,
        `${stylesRoot}/tokens.scoped.css`,
      ];
      for (const rel of wrappedFiles) {
        const srcFile = path.join(stylesRoot, rel);
        const outFile = path.join(tmpCssDir, rel.replace(/\//g, '__'));
        fs.writeFileSync(
          outFile,
          wrapComponentLayerInScope(fs.readFileSync(srcFile, 'utf8')),
          'utf8',
        );
        entryImports.push(outFile.replace(/\\/g, '/'));
      }
      entryImports.push(`${stylesRoot}/modules/emulator-shell.css`);

      await viteBuild({
        configFile: false,
        logLevel: 'warn',
        plugins: [
          {
            name: 'virtual-scoped-css-entry',
            enforce: 'pre',
            resolveId(id) {
              if (id === virtualEntryId || id.endsWith(virtualEntryId)) {
                return resolvedVirtualId;
              }
              return null;
            },
            load(id) {
              if (id === resolvedVirtualId) {
                return `${entryImports.map((p) => `import ${JSON.stringify(p)};`).join('\n')}\nexport {};\n`;
              }
              return null;
            },
          },
          tailwindcss(),
        ],
        build: {
          outDir: tmpDir,
          emptyOutDir: true,
          sourcemap: false,
          cssCodeSplit: false,
          lib: {
            entry: virtualEntryId,
            formats: ['es'],
            fileName: () => 'style.scoped.stub.js',
            cssFileName: 'style.scoped',
          },
        },
      });
      const builtScopedCss = path.join(tmpDir, 'style.scoped.css');
      const fallbackBuiltCss = path.join(tmpDir, 'style.css');
      const srcCss = fs.existsSync(builtScopedCss) ? builtScopedCss : fallbackBuiltCss;
      fs.copyFileSync(srcCss, path.resolve(import.meta.dirname, 'dist/style.scoped.css'));
      fs.rmSync(tmpDir, { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  plugins: [injectLibStyleImports(), react(), tailwindcss(), buildScopedStylesheetPlugin()],
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
        agent: path.resolve(import.meta.dirname, 'src/lib/agent.ts'),
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
