import fs from 'node:fs';
import path from 'node:path';
import { ASSETS, OUT } from './config';
import { site } from './content';
import { shell } from './shell';

export function cleanOutput(): void {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(ASSETS, OUT, { recursive: true });
}

export function relativize(html: string, slug: string): string {
  const depth = slug ? slug.split('/').length : 0;
  const prefix = depth ? '../'.repeat(depth) : './';
  return html
    .replace(/(\s(?:href|src|poster|data-src)=")\/(?!\/)/g, `$1${prefix}`)
    .replace(/(url\(\s*['"]?)\/(?!\/)/g, `$1${prefix}`);
}

export function writePage(slug: string, html: string): void {
  const dest = path.join(OUT, slug, 'index.html');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, relativize(html, slug));
}

export function writeExtras(sitemap: string[]): void {
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

export function validateInternalLinks(pages: Array<{ file: string; slug: string; url: string }>): void {
  const origin = new URL(site.url || 'https://careunlimited.invalid').origin;

  for (const page of pages) {
    const pageUrl = new URL(page.url, `${origin}/`);
    const htmlPath = path.join(OUT, page.slug, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    for (const [, , href] of html.matchAll(/(?:^|\s)(href|src|poster|data-src)="([^"]*)"/g)) {
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
