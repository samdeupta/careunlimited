// Paths and run-mode flags shared by every module.
// build.ts imports this file FIRST, so crash reporting is in place before anything else can fail.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { warn } from './warnings';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT = path.join(ROOT, 'content');
export const ASSETS = path.join(ROOT, 'assets');
export const OUT = path.join(ROOT, 'dist');

// `npx tsx build.ts --strict` (used by the PR check) turns missing images and videos, and content warnings, into a failed build.
export const STRICT = process.argv.includes('--strict');
export const IN_CI = !!process.env.GITHUB_ACTIONS;
if (IN_CI) {
  // Show crashes (bad front matter, missing section file, ...) as a red annotation on the PR.
  process.on('uncaughtException', (e) => {
    console.log(`::error title=Build failed::${String(e.message).split('\n')[0]}`);
    console.error(e);
    process.exit(1);
  });
}

// Two things can't read the stylesheet at runtime: the favicon (an image) and the browser's theme-colour <meta> tag.
// So the build reads the brand colour out of assets/style.css, which stays the one place colours are defined.
// If it can't be found the build carries on with the last known colour, and reports it (a failure under --strict).
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
