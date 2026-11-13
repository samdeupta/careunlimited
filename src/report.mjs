// End-of-build problems: oversized videos, and images / videos that content refers to but that don't exist.
// In --strict mode a missing file fails the build.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS, IN_CI, STRICT } from './config.mjs';
import { missingHeroVideos, missingImages, missingVideos } from './missing.mjs';

/** Print warnings and, in --strict mode, exit with an error if anything is missing. */
export function reportProblems() {
  // Large files: GitHub warns at 50 MB and rejects pushes over 100 MB.
  const bigVideos = [];
  for (const folder of ['vid', 'vids']) {
    (function walk(dir, rel = `${folder}/`) {
      if (!fs.existsSync(dir)) return;
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) walk(path.join(dir, e.name), `${rel}${e.name}/`);
        else if (fs.statSync(path.join(dir, e.name)).size > 50 * 1024 * 1024)
          bigVideos.push(`${rel}${e.name}`);
      }
    })(path.join(ASSETS, folder));
  }
  for (const f of bigVideos) {
    const msg = `assets/${f} is over 50 MB. GitHub warns at 50 MB and rejects files over 100 MB; compress it or host it on YouTube/Vimeo.`;
    console.warn(`\n⚠ ${msg}`);
    if (IN_CI) console.log(`::warning title=Large video::${msg}`);
  }

  let failed = false;
  function reportMissing(set, kind, folder, hint) {
    if (!set.size) return;
    const list = [...set].sort();
    if (IN_CI)
      for (const n of list)
        console.log(
          `::${STRICT ? 'error' : 'warning'} title=${kind} not found::assets/${folder}/${n} is referenced in content but does not exist`,
        );
    console.warn(
      `\n${STRICT ? '✖' : '⚠'} ${list.length} ${kind.toLowerCase()}(s) not found in assets/${folder}${STRICT ? '' : ' (skipped)'}. ${hint}\n  ${list.join('\n  ')}`,
    );
    if (STRICT) failed = true;
  }
  reportMissing(missingImages, 'Image', 'img', 'Run "npm run fetch-images" or add them:');
  reportMissing(missingVideos, 'Video', 'vid', 'Add the files:');
  reportMissing(missingHeroVideos, 'Hero video', 'vids', 'Add the files:');
  if (failed) process.exit(1);
}
