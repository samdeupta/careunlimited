import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { warn } from './warnings';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT = path.join(ROOT, 'content');
export const ASSETS = path.join(ROOT, 'assets');
export const OUT = path.join(ROOT, 'dist');

export const STRICT = process.argv.includes('--strict');
export const IN_CI = !!process.env.GITHUB_ACTIONS;
if (IN_CI) {
  process.on('uncaughtException', (e) => {
    console.log(`::error title=Build failed::${String(e.message).split('\n')[0]}`);
    console.error(e);
    process.exit(1);
  });
}

const FALLBACK_BRAND_DARK = '#0b3a6e';
export const BRAND_DARK = (() => {
  const missing = (why: string): string => {
    warn(`assets/style.css ${why}: it must define "--blue-dark-rgb: R G B" (used for the favicon and theme colour). Using ${FALLBACK_BRAND_DARK}.`);
    return FALLBACK_BRAND_DARK;
  };
  let css: string;
  try {
    css = fs.readFileSync(path.join(ASSETS, 'style.css'), 'utf8');
  } catch {
    return missing('could not be read');
  }
  const m = css.match(/--blue-dark-rgb:\s*(\d+)\s+(\d+)\s+(\d+)/);
  if (!m) return missing('has no --blue-dark-rgb');
  return '#' + m.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
})();
