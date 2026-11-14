import './src/config'; // first: installs crash reporting for CI
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT } from './src/config';
import { load } from './src/content';
import { normalizeComponentData } from './src/schema';
import { renderPage } from './src/page';
import { shell } from './src/shell';
import { cleanOutput, writePage, writeExtras, validateInternalLinks } from './src/output';
import { reportProblems } from './src/report';

cleanOutput();

const pages = fs
  .readdirSync(CONTENT)
  .filter((f) => f.endsWith('.md') && f !== 'site.md')
  .map((f) => {
    const loaded = load(f);
    return { file: f, data: normalizeComponentData(f, loaded.data), content: loaded.content };
  });
const sitemap: string[] = [];
const builtPages: Array<{ file: string; slug: string; url: string }> = [];

for (const p of pages) {
  const d = p.data;
  const slug = d.slug ?? path.basename(p.file, '.md');
  const url = slug ? `/${slug}/` : '/';
  const { html: body, jsonld, features } = renderPage(p, path.basename(p.file, '.md'));
  const html = shell({
    title: slug ? (d.title ?? '') : '',
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
