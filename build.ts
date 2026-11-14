// Care Unlimited: tiny static site generator. Reads Markdown from content/, writes plain HTML to dist/.
//
//   npm run check            type-check and build, with warnings for missing images/videos
//   npx tsx build.ts --strict   build, and fail if any image/video is missing (used by the PR check)
//
// Where things are (each file in src/ has one job; read its header comment first):
//   src/config.ts       paths, run-mode flags, crash reporting, brand colour
//   src/util.ts         esc / slugify / unesc
//   src/content.ts      load a content file; the site-wide settings (site.md)
//   src/markdown.ts     Markdown -> HTML, {{ placeholders }}, cutting text at headings
//   src/images.ts       image names -> <img> / URLs     src/video.ts  video players
//   src/missing.ts      files referred to but not found  src/report.ts  end-of-build report
//   src/features.ts     the image viewer (extra markup + script for pages that need it)
//   src/components/      one file per block type (text, cards, accordion, gallery, ...) + registry.ts
//   src/page.ts         assembles one page from its settings, text and blocks
//   src/shell.ts        fills the HTML page template; src/templates/ holds reusable HTML templates
//   src/output.ts       writes dist/: pages, 404, sitemap, robots
import './src/config'; // first: installs crash reporting for CI
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT } from './src/config';
import { load } from './src/content';
import { renderPage } from './src/page';
import { shell } from './src/shell';
import { cleanOutput, writePage, writeExtras, validateInternalLinks } from './src/output';
import { reportProblems } from './src/report';

cleanOutput();

// Every .md file in content/ (except site.md) is a page.
const pages = fs
  .readdirSync(CONTENT)
  .filter((f) => f.endsWith('.md') && f !== 'site.md')
  .map((f) => ({ file: f, ...load(f) }));
const sitemap: string[] = [];
const builtPages: Array<{ file: string; slug: string; url: string }> = [];

for (const p of pages) {
  const d = p.data;
  const slug = d.slug ?? path.basename(p.file, '.md');
  const url = slug ? `/${slug}/` : '/';
  const { html: body, jsonld, features } = renderPage(p, path.basename(p.file, '.md'));
  // The root page (slug "") has no title of its own: shell() falls back to the site name + tagline.
  const html = shell({
    title: slug ? d.title : '',
    description: d.description,
    url,
    body,
    jsonld,
    features,
  });
  writePage(slug, html);
  sitemap.push(url);
  builtPages.push({ file: p.file, slug, url });
}

writeExtras(sitemap);
validateInternalLinks(builtPages);
console.log(`Built ${pages.length} pages -> dist/`);
reportProblems();
