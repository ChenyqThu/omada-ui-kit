import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const EXTERNAL_ASSET_GROUPS = ['products', 'illustrations', 'clients', 'brand'] as const;
const pkg = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf8'),
) as { version: string };

function copyDirRecursive(srcDir: string, destDir: string): void {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Bypasses Vite 8 `build.lib` forced base64 asset inlining for heavy media groups
 * (`products`, `illustrations` except builtin `no-data.svg`/`upgrade.svg`, `clients`, `brand`),
 * emitting relative `"assets/<group>/<relPath>"` URLs resolved via `__OMADA_ASSET_BASE__`
 * while keeping `icons` (`SIcon`) and `builtinIllustrations` 100% inline.
 */
function externalizeStandaloneAssets(): Plugin {
  const assetsRoot = path.resolve(import.meta.dirname, 'src/assets').replace(/\\/g, '/');
  const distAssetsRoot = path.resolve(import.meta.dirname, 'dist/assets');

  return {
    name: 'omada-standalone-external-assets',
    enforce: 'pre',
    load(id) {
      const cleanId = id.split('?')[0].replace(/\\/g, '/');
      if (!cleanId.startsWith(`${assetsRoot}/`)) {
        return null;
      }
      const relativeFromAssets = cleanId.slice(assetsRoot.length + 1);
      const slashIdx = relativeFromAssets.indexOf('/');
      if (slashIdx === -1) return null;

      const group = relativeFromAssets.slice(0, slashIdx);
      const relPath = relativeFromAssets.slice(slashIdx + 1);

      if (
        !EXTERNAL_ASSET_GROUPS.includes(
          group as (typeof EXTERNAL_ASSET_GROUPS)[number],
        )
      ) {
        return null;
      }

      // Keep builtinIllustrations (`no-data.svg` and `upgrade.svg`) inline for SEmpty/SUpload/SAclRuleBuilder
      if (
        group === 'illustrations' &&
        /^(light|dark)\/(no-data|upgrade)\.svg$/i.test(relPath)
      ) {
        return null;
      }

      return `export default ${JSON.stringify(`assets/${group}/${relPath}`)};`;
    },
    closeBundle() {
      for (const group of EXTERNAL_ASSET_GROUPS) {
        const srcGroupDir = path.join(import.meta.dirname, 'src/assets', group);
        const destGroupDir = path.join(distAssetsRoot, group);
        copyDirRecursive(srcGroupDir, destGroupDir);
      }
    },
  };
}

export default defineConfig({
  plugins: [externalizeStandaloneAssets(), react()],
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __OMADA_PKG_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/lib/standalone.ts'),
      formats: ['iife'],
      name: 'OmadaUI',
      fileName: () => 'standalone.js',
    },
    rolldownOptions: {
      output: {
        codeSplitting: false,
      },
    },
  },
});
