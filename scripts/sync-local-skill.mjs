#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function copyDirRecursive(srcDir, destDir) {
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

const canonicalSkillDir = path.join(ROOT_DIR, 'skills/omada-ui-kit');
const localUserSkillDir = path.join(os.homedir(), '.gemini/config/skills/omada-ui-kit');

if (!fs.existsSync(canonicalSkillDir)) {
  console.error(`Missing canonical skill directory: ${canonicalSkillDir}`);
  process.exit(1);
}

fs.rmSync(localUserSkillDir, { recursive: true, force: true });
copyDirRecursive(canonicalSkillDir, localUserSkillDir);
console.log(`Synced canonical skill bundle to ${localUserSkillDir}`);
