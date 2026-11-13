// Assembling one page: banner, hero or title, the page's own text, then each block listed in `sections`.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS, CONTENT } from './config.mjs';
import { load } from './content.mjs';
import { esc, slugify } from './util.mjs';
import { imgTag } from './images.mjs';
import { missingImages } from './missing.mjs';
import { COMPONENTS } from './components/registry.mjs';

const banner = (d) => (d.banner ? `<div class="banner">${imgTag(d.banner, '')}</div>` : '');

/* ---------- page renderer (the only place pages are assembled) ----------
   page = banner + (hero | <h1> title) + [the page's own body, shown as `type`] + each file in `sections`. */
export function renderPage(p, fileBase) {
  const d = p.data;
  if ('layout' in d)
    throw new Error(
      `content/${p.file}: "layout" is no longer used. Use "type:" instead (${Object.keys(COMPONENTS).join(', ')}).`,
    );
  const ctx = { page: false, features: new Set(), jsonld: [] };
  const parts = [];
  if (p.content.trim() || d.type)
    parts.push({ rel: p.file, id: '', data: d, content: p.content, page: true });
  const dir = d.sections_dir || fileBase;
  for (const name of d.sections || []) {
    const rel = `${dir}/${name}.md`;
    if (!fs.existsSync(path.join(CONTENT, rel)))
      throw new Error(`Section file not found: content/${rel}`);
    parts.push({ rel, id: slugify(name), ...load(rel), page: false });
  }
  const bands = parts.map((part, i) => {
    const type = part.data.type ?? 'text';
    const component = COMPONENTS[type];
    if (!component)
      throw new Error(
        `content/${part.rel}: unknown type "${type}". Available types: ${Object.keys(COMPONENTS).join(', ')}`,
      );
    let inner;
    try {
      inner = component(part.data, part.content, { ...ctx, page: part.page });
    } catch (e) {
      throw new Error(
        e.message.startsWith('content/') ? e.message : `content/${part.rel}: ${e.message}`,
      );
    }
    const id = part.id ? ` id="${part.id}"` : '';
    return `<section class="band reveal${i % 2 ? ' tint' : ''}"${id}><div class="wrap">${inner}</div></section>`;
  });

  let head = banner(d);
  if (d.hero_title) {
    const buttons = (d.hero_buttons || [])
      .map((b, i) => `<a class="btn${i ? ' ghost' : ''}" href="${esc(b.url)}">${esc(b.label)}</a>`)
      .join(' ');
    const hasImg = d.hero_image && fs.existsSync(path.join(ASSETS, 'imgs', d.hero_image));
    if (d.hero_image && !hasImg) missingImages.add(d.hero_image);
    const bg = hasImg ? ` style="--hero-img:url('/imgs/${esc(d.hero_image)}')"` : '';
    head += `<section class="hero${hasImg ? ' has-image' : ''}"${bg}><div class="wrap"><h1>${esc(d.hero_title)}</h1>${d.hero_text ? `<p>${esc(d.hero_text)}</p>` : ''}${buttons ? `<p>${buttons}</p>` : ''}</div></section>`;
  } else if (d.title && d.show_title !== false) {
    head += `<div class="wrap page-head"><h1>${esc(d.title)}</h1></div>`; // the page title is the <h1>
  }
  const html = head + bands.join('\n');
  // Any page with viewer links (gallery pictures, video thumbnails) gets the viewer markup + script.
  if (html.includes('data-viewer=')) ctx.features.add('lightbox');
  return { html, jsonld: ctx.jsonld, features: ctx.features };
}
