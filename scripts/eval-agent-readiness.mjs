#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SKILL_DIR = path.join(ROOT_DIR, 'skills/omada-ui-kit');
const VERIFY_SCRIPT = path.join(SKILL_DIR, 'scripts/verify-demo.mjs');
const TMP_MUTATION_DIR = path.join(ROOT_DIR, 'node_modules/.tmp/agent-eval-mutations');

function approxTokens(text) {
  return Math.ceil(Buffer.byteLength(text, 'utf8') / 4);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`EVAL ASSERTION FAILED: ${message}`);
  }
}

function runVerifier(filePaths, extraArgs = []) {
  const targets = Array.isArray(filePaths) ? filePaths : [filePaths];
  const res = spawnSync(process.execPath, [VERIFY_SCRIPT, ...extraArgs, ...targets], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  });
  return {
    status: res.status ?? 1,
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
  };
}

function main() {
  console.log('=== Omada UI Kit — Agent Readiness & Verification Benchmark ===\n');

  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'),
  );

  // 1. Progressive Disclosure Token Budget Evaluation
  const skillMd = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf8');
  const llmsTxt = fs.readFileSync(path.join(SKILL_DIR, 'references/llms.txt'), 'utf8');
  const standaloneMd = fs.readFileSync(path.join(SKILL_DIR, 'references/standalone.md'), 'utf8');
  const catalogRaw = fs.readFileSync(path.join(SKILL_DIR, 'references/catalog.json'), 'utf8');
  const componentsMd = fs.readFileSync(path.join(ROOT_DIR, 'COMPONENTS.md'), 'utf8');
  const blocksDoc = fs.readFileSync(path.join(SKILL_DIR, 'references/docs/blocks.md'), 'utf8');
  const agentDoc = fs.readFileSync(path.join(SKILL_DIR, 'references/docs/agent.md'), 'utf8');

  const legacyMonolithTokens = approxTokens(catalogRaw) + approxTokens(componentsMd);
  const skillEntryTokens = approxTokens(skillMd);
  const routerPlusIndexTokens = skillEntryTokens + approxTokens(llmsTxt);
  const typicalBlocksTaskTokens = skillEntryTokens + approxTokens(blocksDoc);
  const typicalStandaloneTaskTokens =
    skillEntryTokens + approxTokens(standaloneMd) + approxTokens(blocksDoc);
  const reductionPct = (
    ((legacyMonolithTokens - typicalBlocksTaskTokens) / legacyMonolithTokens) *
    100
  ).toFixed(1);

  console.log('[1/4] Context & Progressive Disclosure Token Budget:');
  console.log(`  - Legacy monolithic (catalog.json + COMPONENTS.md): ~${legacyMonolithTokens} tokens`);
  console.log(`  - SKILL.md entrypoint:                              ~${skillEntryTokens} tokens`);
  console.log(`  - SKILL.md + llms.txt index:                        ~${routerPlusIndexTokens} tokens`);
  console.log(`  - Typical Blocks page task (SKILL.md + blocks.md):  ~${typicalBlocksTaskTokens} tokens (-${reductionPct}%)`);
  console.log(`  - Standalone HTML task (+ standalone.md):           ~${typicalStandaloneTaskTokens} tokens`);
  console.log(`  - Agent Bridge doc (agent.md):                      ~${approxTokens(agentDoc)} tokens\n`);

  assert(skillEntryTokens <= 2500, `SKILL.md too large (${skillEntryTokens} tokens > 2500)`);
  assert(
    routerPlusIndexTokens <= 4000,
    `SKILL.md + llms.txt too large (${routerPlusIndexTokens} tokens > 4000)`,
  );
  assert(
    typicalBlocksTaskTokens < legacyMonolithTokens * 0.2,
    `Progressive disclosure did not achieve >=80% token reduction vs monolithic catalog`,
  );

  // 2. Build Artifact & Bundle Budget Verification (when dist/ is present)
  const standaloneDist = path.join(ROOT_DIR, 'dist/standalone.js');
  if (fs.existsSync(standaloneDist)) {
    const standaloneBytes = fs.statSync(standaloneDist).size;
    const styleBytes = fs.statSync(path.join(ROOT_DIR, 'dist/style.css')).size;
    const scopedStylePath = path.join(ROOT_DIR, 'dist/style.scoped.css');
    const llmsDistPath = path.join(ROOT_DIR, 'dist/llms.txt');

    assert(fs.existsSync(scopedStylePath), 'Missing dist/style.scoped.css');
    assert(fs.existsSync(llmsDistPath), 'Missing dist/llms.txt');
    for (const group of ['products', 'illustrations', 'clients', 'brand']) {
      assert(
        fs.existsSync(path.join(ROOT_DIR, 'dist/assets', group)),
        `Missing externalized standalone asset directory dist/assets/${group}`,
      );
    }

    const standaloneMb = (standaloneBytes / (1024 * 1024)).toFixed(2);
    const styleKb = (styleBytes / 1024).toFixed(1);
    const scopedKb = (fs.statSync(scopedStylePath).size / 1024).toFixed(1);

    console.log('[2/4] Dist Bundle & Isolation Budgets:');
    console.log(`  - dist/standalone.js:     ${standaloneMb} MB (budget <= 4.50 MB)`);
    console.log(`  - dist/style.css:         ${styleKb} KB (budget <= 230.0 KB)`);
    console.log(`  - dist/style.scoped.css:  ${scopedKb} KB (no preflight reset)\n`);

    assert(
      standaloneBytes <= 4.5 * 1024 * 1024,
      `dist/standalone.js exceeded 4.5 MB budget (${standaloneMb} MB)`,
    );
    assert(styleBytes <= 230 * 1024, `dist/style.css exceeded 230 KB budget (${styleKb} KB)`);
  } else {
    console.log('[2/4] Dist Bundle & Isolation Budgets: skipped (dist/ not built yet)\n');
  }

  // 3. Dual-Engine Verifier Precision & Adversarial Recall Suite
  const positiveFiles = [
    ...fs
      .readdirSync(path.join(SKILL_DIR, 'templates'))
      .map((f) => path.join(SKILL_DIR, 'templates', f)),
    path.join(ROOT_DIR, 'examples/single-file-demo.html'),
    path.join(ROOT_DIR, 'src/showcase/demos/DeviceListDemo.tsx'),
    path.join(ROOT_DIR, 'src/demos/omada-ap-health-monitor/Demo.tsx'),
  ];

  let positiveChecks = 0;
  for (const posFile of positiveFiles) {
    for (const engineArgs of [[], ['--engine=lexical']]) {
      const res = runVerifier(posFile, engineArgs);
      assert(
        res.status === 0,
        `False positive on valid file ${path.relative(ROOT_DIR, posFile)} (${engineArgs.join(' ') || 'ts-ast'}): ${res.stderr}`,
      );
      positiveChecks += 1;
    }
  }

  const baseValidHtml = fs.readFileSync(
    path.join(SKILL_DIR, 'templates/dashboard.html'),
    'utf8',
  );

  const mutations = [
    {
      name: 'unknown-s-component.tsx',
      code: `import { OmadaProvider } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <OmadaProvider><SHallucinatedWidget foo="1" /></OmadaProvider>;\n`,
      expectedSubstring: 'Unknown Omada component <SHallucinatedWidget>',
    },
    {
      name: 'ghost-prop-block.tsx',
      code: `import { SFilterTableBlock } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <SFilterTableBlock hallucinatedProp="bad" tableProps={{ columns: [], dataSource: [] }} />;\n`,
      expectedSubstring: 'Unknown/ghost prop `hallucinatedProp`',
    },
    {
      name: 'ghost-prop-union.tsx',
      code: `import { STileGroup } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <STileGroup mode="single" nonExistentTileProp />;\n`,
      expectedSubstring: 'Unknown/ghost prop `nonExistentTileProp`',
    },
    {
      name: 'unpinned-latest-cdn.html',
      code: baseValidHtml.replace(`@${pkg.version}/dist/style.css`, '@latest/dist/style.css'),
      expectedSubstring: 'Unpinned @latest CDN URL',
    },
    {
      name: 'unpinned-babel-cdn.html',
      code: baseValidHtml.replace(
        '@babel/standalone@7.28.4/babel.min.js',
        '@babel/standalone/babel.min.js',
      ),
      expectedSubstring: 'Unpinned Babel CDN URL',
    },
    {
      name: 'protocol-relative-unpinned-cdn.html',
      code: baseValidHtml.replace(
        `https://cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@${pkg.version}/dist/style.css`,
        '//cdn.jsdelivr.net/npm/@chenyqthu/omada-ui-kit@latest/dist/style.css',
      ),
      expectedSubstring: 'Unpinned @latest CDN URL',
    },
    {
      name: 'forgot-babel-script-type.html',
      code: baseValidHtml.replace('<script type="text/babel">', '<script>'),
      expectedSubstring: 'Missing <script type="text/babel">',
    },
    {
      name: 'missing-babel-runtime-script.html',
      code: baseValidHtml.replace(
        '<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.28.4/babel.min.js"></script>',
        '',
      ),
      expectedSubstring: 'Missing @babel/standalone script',
    },
    {
      name: 'pr9-overridden-by-inline-padding.tsx',
      code: `import { SEmulatorShell } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <SEmulatorShell activeKey="dashboard" onSelect={() => {}}><div className="pr-9" style={{ padding: 20 }}>Body</div></SEmulatorShell>;\n`,
      expectedSubstring: 'overridden by inline',
    },
    {
      name: 'sbutton-type-with-nested-jsx.tsx',
      code: `import { SButton, SIcon } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <SButton icon={<SIcon name="refresh" size={14} />} type="primary">Refresh</SButton>;\n`,
      expectedSubstring: '<SButton> does not accept `type=`',
    },
    {
      name: 'nested-bad-icon-slug.tsx',
      code: `import { SPageHeader, SButton, SIcon } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <SPageHeader title="T" extra={<SButton variant="primary" icon={<SIcon name="totally-fake-icon-slug" />}>Go</SButton>} />;\n`,
      expectedSubstring: 'Unknown SIcon name="totally-fake-icon-slug"',
    },
    {
      name: 'icon-only-button-missing-aria-label.tsx',
      code: `import { SButton, SIcon } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <SButton variant="secondary" icon={<SIcon name="refresh" />} />;\n`,
      expectedSubstring: 'missing an accessible name',
    },
    {
      name: 'missing-omada-provider.html',
      code: baseValidHtml
        .replace('<OmadaProvider defaultThemeMode="light">', '<div>')
        .replace('</OmadaProvider>', '</div>'),
      expectedSubstring: 'Missing <OmadaProvider>',
    },
    {
      name: 'deprecated-antd5-props.tsx',
      code: `import { SModal } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <SModal visible destroyOnClose title="Legacy">Body</SModal>;\n`,
      expectedSubstring: 'Deprecated',
    },
    {
      name: 'apostrophe-and-inline-jsx-text.tsx',
      code: `import { OmadaProvider } from '@chenyqthu/omada-ui-kit';\nexport const X = () => <OmadaProvider><p>Controller's Wireless Settings — open <SHallucinatedAfterApostrophe bad="1" /> now</p></OmadaProvider>;\n`,
      expectedSubstring: 'Unknown Omada component <SHallucinatedAfterApostrophe>',
    },
  ];

  fs.rmSync(TMP_MUTATION_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_MUTATION_DIR, { recursive: true });

  let caughtMutations = 0;
  try {
    // Verify alternate pinned x.y.z Babel CDN domains remain accepted without false positives
    const altBabelHtmlPath = path.join(TMP_MUTATION_DIR, 'valid-alt-pinned-babel.html');
    fs.writeFileSync(
      altBabelHtmlPath,
      baseValidHtml.replace(
        /https?:\/\/[^"']*@babel\/standalone@7\.28\.4\/babel\.min\.js/,
        'https://unpkg.com/@babel/standalone@7.28.4/babel.min.js',
      ),
      'utf8',
    );
    for (const engineArgs of [[], ['--engine=lexical']]) {
      const altRes = runVerifier(altBabelHtmlPath, engineArgs);
      assert(
        altRes.status === 0,
        `False positive on pinned alternate Babel CDN URL: ${altRes.stderr}`,
      );
      positiveChecks += 1;
    }

    // Verify multi-file CLI batch pass (both pre-expanded array and unexpanded wildcard glob)
    const allHtmlTemplates = positiveFiles.filter((f) => f.endsWith('.html'));
    for (const engineArgs of [[], ['--engine=lexical']]) {
      const batchPassRes = runVerifier(allHtmlTemplates, engineArgs);
      assert(
        batchPassRes.status === 0,
        `Multi-file verifier failed on valid HTML batch: ${batchPassRes.stderr}`,
      );
      for (const tplPath of allHtmlTemplates) {
        assert(
          batchPassRes.stdout.includes(`PASS [${tplPath}]`),
          `Multi-file verifier skipped valid file ${tplPath}`,
        );
      }
      positiveChecks += 1;

      const globPassRes = runVerifier('skills/omada-ui-kit/templates/*.html', engineArgs);
      assert(
        globPassRes.status === 0,
        `Unexpanded glob verifier failed on templates/*.html: ${globPassRes.stderr}`,
      );
      assert(
        globPassRes.stdout.includes('PASS [skills/omada-ui-kit/templates/settings.html]'),
        `Unexpanded glob verifier did not expand all template HTML files`,
      );
      positiveChecks += 1;
    }

    const helpRes = runVerifier([], ['--help']);
    assert(helpRes.status === 0 && helpRes.stdout.includes('Usage:'), '--help did not exit 0 with usage');
    positiveChecks += 1;

    for (const m of mutations) {
      const filePath = path.join(TMP_MUTATION_DIR, m.name);
      fs.writeFileSync(filePath, m.code, 'utf8');
      for (const engineArgs of [[], ['--engine=lexical']]) {
        const res = runVerifier(filePath, engineArgs);
        const engineLabel = engineArgs.length ? 'lexical' : 'ts-ast';
        assert(
          res.status !== 0,
          `Verifier missed mutation ${m.name} under engine=${engineLabel}`,
        );
        assert(
          res.stderr.includes(m.expectedSubstring),
          `Mutation ${m.name} (${engineLabel}) failed with unexpected error: "${res.stderr.trim()}" (expected "${m.expectedSubstring}")`,
        );
        caughtMutations += 1;
      }
    }

    // Verify multi-file CLI arguments intercept errors and missing paths in the 2nd+ positional file
    const validFirstFile = path.join(SKILL_DIR, 'templates/dashboard.html');
    const invalidSecondFile = path.join(TMP_MUTATION_DIR, 'unknown-s-component.tsx');
    const missingSecondFile = path.join(TMP_MUTATION_DIR, 'non-existent-second-demo.html');

    for (const engineArgs of [[], ['--engine=lexical']]) {
      const engineLabel = engineArgs.length ? 'lexical' : 'ts-ast';
      const multiErrRes = runVerifier([validFirstFile, invalidSecondFile], engineArgs);
      assert(
        multiErrRes.status !== 0,
        `Multi-file verifier silently ignored error in 2nd file under engine=${engineLabel}`,
      );
      assert(
        multiErrRes.stdout.includes(`PASS [${validFirstFile}]`),
        `Multi-file verifier did not report PASS for 1st valid file (${engineLabel})`,
      );
      assert(
        multiErrRes.stderr.includes('Unknown Omada component <SHallucinatedWidget>'),
        `Multi-file verifier did not report 2nd file error (${engineLabel}): "${multiErrRes.stderr.trim()}"`,
      );
      caughtMutations += 1;

      const multiMissingRes = runVerifier([validFirstFile, missingSecondFile], engineArgs);
      assert(
        multiMissingRes.status !== 0,
        `Multi-file verifier silently ignored missing 2nd file under engine=${engineLabel}`,
      );
      assert(
        multiMissingRes.stderr.includes('File not found'),
        `Multi-file verifier did not report missing 2nd file (${engineLabel}): "${multiMissingRes.stderr.trim()}"`,
      );
      caughtMutations += 1;

      const unmatchedGlobRes = runVerifier(
        [validFirstFile, 'skills/omada-ui-kit/templates/*.nonexistent'],
        engineArgs,
      );
      assert(
        unmatchedGlobRes.status !== 0 &&
          unmatchedGlobRes.stderr.includes('No files matched pattern'),
        `Verifier did not reject unmatched glob pattern (${engineLabel}): "${unmatchedGlobRes.stderr.trim()}"`,
      );
      caughtMutations += 1;
    }

    for (const badCliArgs of [
      ['--unknown-flag', validFirstFile],
      [validFirstFile, '--unknown-flag'],
      ['--engine=typo', validFirstFile],
      ['-z', validFirstFile],
    ]) {
      const badFlagRes = runVerifier([], badCliArgs);
      assert(
        badFlagRes.status !== 0,
        `Verifier silently accepted invalid CLI args: ${badCliArgs.join(' ')}`,
      );
      caughtMutations += 1;
    }
  } finally {
    fs.rmSync(TMP_MUTATION_DIR, { recursive: true, force: true });
  }

  console.log('[3/4] Dual-Engine verify-demo.mjs Precision & Recall:');
  console.log(`  - Positive baseline runs passed:  ${positiveChecks}/${positiveChecks} (0 false positives)`);
  console.log(`  - Adversarial mutations caught:   ${caughtMutations}/${caughtMutations} (100% recall across ts-ast & lexical)\n`);

  // 4. Agent Bridge Schema & Secret Masking Metadata Audit
  const catalog = JSON.parse(catalogRaw);
  const compMap = new Map(catalog.components.map((c) => [c.name, c]));
  const requiredAgentComponents = [
    'SSwitch',
    'SSelect',
    'SInput',
    'SPasswordInput',
    'STabs',
    'SFilterTableBlock',
    'SSettingsPageShell',
  ];
  for (const compName of requiredAgentComponents) {
    const comp = compMap.get(compName);
    assert(comp, `Missing component ${compName} in catalog.json`);
    assert(
      comp.props?.some((p) => p.name === 'agentId'),
      `${compName} is missing agentId prop in catalog.json`,
    );
  }
  assert(
    compMap.get('SPasswordInput')?.props?.some((p) => p.name === 'secret'),
    'SPasswordInput is missing secret prop in catalog.json',
  );
  assert(
    compMap.get('OmadaAgentProvider')?.props?.some((p) => p.name === 'allow'),
    'OmadaAgentProvider is missing allow prop in catalog.json',
  );

  console.log('[4/4] Agent Bridge Schema & Secret Masking Audit:');
  console.log(`  - Verified agentId registration schema on ${requiredAgentComponents.length}/7 core controls & shells`);
  console.log('  - Verified OmadaAgentProvider allow policy & SPasswordInput secret masking metadata\n');

  console.log('PASS: All Agent readiness benchmarks and verifier gates succeeded.');
}

main();
