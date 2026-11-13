// Care Unlimited: tiny static site generator. Reads Markdown from content/, writes plain HTML to dist/.
//
//   node build.mjs            build, warn about missing images/videos
//   node build.mjs --strict   build, and fail if any image/video is missing (used by the PR check)
//
// Where things are (each file in src/ has one job; read its header comment first):
//   src/config.mjs       paths, run-mode flags, crash reporting, brand colour
//   src/util.mjs         esc / slugify / unesc
//   src/content.mjs      load a content file; the site-wide settings (site.md)
//   src/markdown.mjs     Markdown -> HTML, {{ placeholders }}, cutting text at headings
//   src/images.mjs       image names -> <img> / URLs     src/video.mjs  video players
//   src/missing.mjs      files referred to but not found  src/report.mjs  end-of-build report
//   src/features.mjs     the image viewer (extra markup + script for pages that need it)
//   src/components/      one file per block type (text, cards, accordion, gallery, ...) + registry.mjs
//   src/page.mjs         assembles one page from its settings, text and blocks
//   src/shell.mjs        fills the HTML page template; src/templates/ holds reusable HTML templates
//   src/output.mjs       writes dist/: pages, 404, sitemap, robots
import './src/config.mjs'; // first: installs crash reporting for CI
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT } from './src/config.mjs';
import { load } from './src/content.mjs';
import { renderPage } from './src/page.mjs';
import { shell } from './src/shell.mjs';
import { cleanOutput, writePage, writeExtras } from './src/output.mjs';
import { reportProblems } from './src/report.mjs';

cleanOutput();

// Every .md file in content/ (except site.md) is a page.
const pages = fs
  .readdirSync(CONTENT)
  .filter((f) => f.endsWith('.md') && f !== 'site.md')
  .map((f) => ({ file: f, ...load(f) }));
const sitemap = [];

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
}

writeExtras(sitemap);
console.log(`Built ${pages.length} pages -> dist/`);
reportProblems();
