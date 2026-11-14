// Writing files into dist/: the clean start, one HTML file per page, and 404 / sitemap / robots.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS, OUT } from './config';
import { site } from './content';
import { shell } from './shell';

/** Empty dist/ and copy assets/ into it (stylesheet, images, videos, favicon.ico if any). */
export function cleanOutput(): void {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(ASSETS, OUT, { recursive: true });
}

/** Write dist/<slug>/index.html (or dist/index.html for the root page). */
export function writePage(slug: string, html: string): void {
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
export function writeExtras(sitemap: string[]): void {
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
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((item: string) => `  <url><loc>${base}${item}</loc></url>`).join('\n')}\n</urlset>\n`,
    );
    fs.writeFileSync(
      path.join(OUT, 'robots.txt'),
      `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`,
    );
  }
}

/** Fail the build when a content-generated link points to a file or page that was not built. */
export function validateInternalLinks(pages: Array<{ file: string; slug: string; url: string }>): void {
  const origin = new URL(site.url || 'https://careunlimited.invalid').origin;

  for (const page of pages) {
    const pageUrl = new URL(page.url, `${origin}/`);
    const htmlPath = path.join(OUT, page.slug, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    for (const [, href] of html.matchAll(/\bhref="([^"]*)"/g)) {
      let target: URL;
      try {
        target = new URL(href, pageUrl);
      } catch {
        throw new Error(`content/${page.file}: invalid link "${href}"`);
      }
      if (target.origin !== origin) continue;

      let pathname: string;
      try {
        pathname = decodeURIComponent(target.pathname);
      } catch {
        throw new Error(`content/${page.file}: invalid link path "${target.pathname}"`);
      }
      const targetPath = path.resolve(OUT, `.${pathname}`);
      if (targetPath !== OUT && !targetPath.startsWith(`${OUT}${path.sep}`))
        throw new Error(`content/${page.file}: link "${href}" points outside the built site`);

      let filePath = targetPath;
      if (pathname.endsWith('/') || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()))
        filePath = path.join(filePath, 'index.html');
      else if (!path.extname(pathname) && !fs.existsSync(filePath))
        filePath = path.join(filePath, 'index.html');

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
        throw new Error(`content/${page.file}: link "${href}" points to missing route or file "${pathname}"`);
    }
  }
}
