// End-of-build problems: oversized videos, images / videos that content refers to but that don't exist, and content
// warnings (misspelled settings, ...). In --strict mode any of these fails the build.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS, IN_CI, STRICT } from './config';
import { missingHeroVideos, missingImages, missingVideos } from './missing';
import { warnings } from './warnings';

/** Print warnings and, in --strict mode, exit with an error if anything is missing. */
export function reportProblems(): void {
  // Large files: GitHub warns at 50 MB and rejects pushes over 100 MB.
  const bigVideos: string[] = [];
  for (const folder of ['vid', 'vids']) {
    (function walk(dir: string, rel = `${folder}/`): void {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(path.join(dir, entry.name), `${rel}${entry.name}/`);
        else if (fs.statSync(path.join(dir, entry.name)).size > 50 * 1024 * 1024)
          bigVideos.push(`${rel}${entry.name}`);
      }
    })(path.join(ASSETS, folder));
  }
  for (const file of bigVideos) {
    const msg = `assets/${file} is over 50 MB. GitHub warns at 50 MB and rejects files over 100 MB; compress it or host it on YouTube/Vimeo.`;
    console.warn(`\n⚠ ${msg}`);
    if (IN_CI) console.log(`::warning title=Large video::${msg}`);
  }

  let failed = false;
  function reportMissing(set: Set<string>, kind: string, folder: string, hint: string): void {
    if (!set.size) return;
    const list = [...set].sort();
    if (IN_CI)
      for (const name of list)
        console.log(
          `::${STRICT ? 'error' : 'warning'} title=${kind} not found::assets/${folder}/${name} is referenced in content but does not exist`,
        );
    console.warn(
      `\n${STRICT ? '✖' : '⚠'} ${list.length} ${kind.toLowerCase()}(s) not found in assets/${folder}${STRICT ? '' : ' (skipped)'}. ${hint}\n  ${list.join('\n  ')}`,
    );
    if (STRICT) failed = true;
  }
  reportMissing(missingImages, 'Image', 'imgs', 'Add the files:');
  reportMissing(missingVideos, 'Video', 'vid', 'Add the files:');
  reportMissing(missingHeroVideos, 'Hero video', 'vids', 'Add the files:');
  if (warnings.length) {
    if (IN_CI) for (const message of warnings) console.log(`::${STRICT ? 'error' : 'warning'} title=Content problem::${message}`);
    console.warn(`\n${STRICT ? '✖' : '⚠'} ${warnings.length} content problem(s):\n  ${warnings.join('\n  ')}`);
    if (STRICT) failed = true;
  }
  if (failed) process.exit(1);
}
