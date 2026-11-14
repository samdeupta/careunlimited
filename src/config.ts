// Paths and run-mode flags shared by every module.
// build.ts imports this file FIRST, so crash reporting is in place before anything else can fail.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT = path.join(ROOT, 'content');
export const ASSETS = path.join(ROOT, 'assets');
export const OUT = path.join(ROOT, 'dist');

// `node build.ts --strict` (used by the PR check) turns missing images and videos into a failed build.
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
export const BRAND_DARK = (() => {
  const css = fs.readFileSync(path.join(ASSETS, 'style.css'), 'utf8');
  const m = css.match(/--blue-dark-rgb:\s*(\d+)\s+(\d+)\s+(\d+)/);
  if (!m)
    throw new Error(
      'assets/style.css must define "--blue-dark-rgb: R G B" (the build uses it for the favicon and theme colour)',
    );
  return (
    '#' +
    m
      .slice(1, 4)
      .map((n) => Number(n).toString(16).padStart(2, '0'))
      .join('')
  );
})();
