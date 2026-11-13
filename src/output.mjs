// Writing files into dist/: the clean start, one HTML file per page, and 404 / sitemap / robots.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS, OUT } from './config.mjs';
import { site } from './content.mjs';
import { shell } from './shell.mjs';

/** Empty dist/ and copy assets/ into it (stylesheet, images, videos, favicon.ico if any). */
export function cleanOutput() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(ASSETS, OUT, { recursive: true });
}

/** Write dist/<slug>/index.html (or dist/index.html for the root page). */
export function writePage(slug, html) {
  const depth = slug ? slug.split('/').length : 0;
  const prefix = depth ? '../'.repeat(depth) : './';
  // All templates use root-relative URLs; make them relative so the site works from any folder or sub-path.
  const out = html
    .replace(/(href|src|poster)="\/(?!\/)/g, `$1="${prefix}`)
    .replace(/url\('\/imgs\//g, `url('${prefix}imgs/`);
  const dest = path.join(OUT, slug, 'index.html');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out);
}

/** 404.html, and (when site.url is set) sitemap.xml + robots.txt. */
export function writeExtras(sitemap) {
  // 404 (root-absolute links, because it is served from arbitrary paths)
  fs.writeFileSync(
    path.join(OUT, '404.html'),
    shell({
      title: 'Page not found',
      url: '/404',
      body: `<div class="wrap page-head"><h1>Page not found</h1><p>Sorry, we couldn’t find that page. <a href="/">Go to the home page</a>.</p></div>`,
    }),
  );

  if (site.url) {
    const base = site.url.replace(/\/$/, '');
    fs.writeFileSync(
      path.join(OUT, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`,
    );
    fs.writeFileSync(
      path.join(OUT, 'robots.txt'),
      `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`,
    );
  }
}
