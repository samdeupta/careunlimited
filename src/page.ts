// Assembling one page: banner, hero or title, the page's own text, then each block listed in `sections`.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS, CONTENT } from './config';
import { load } from './content';
import { esc, slugify } from './util';
import { imgTag } from './images';
import { missingHeroVideos, missingImages } from './missing';
import { COMPONENTS } from './components/registry';
import type { ComponentContext, ComponentData, PageRecord, RenderedPage } from './types';

const banner = (d: ComponentData): string => (d.banner ? `<div class="banner">${imgTag(d.banner, '')}</div>` : '');

/* ---------- page renderer (the only place pages are assembled) ----------
   page = banner + (hero | <h1> title) + [the page's own body, shown as `type`] + each file in `sections`. */
export function renderPage(p: PageRecord, fileBase: string): RenderedPage {
  const d = p.data;
  if ('layout' in d)
    throw new Error(
      `content/${p.file}: "layout" is no longer used. Use "type:" instead (${Object.keys(COMPONENTS).join(', ')}).`,
    );
  const ctx: ComponentContext = {
    page: false,
    features: new Set<string>(),
    jsonld: [],
  };
  const parts: Array<{ rel: string; id: string; data: ComponentData; content: string; page: boolean }> = [];
  if (p.content.trim() || d.type)
    parts.push({ rel: p.file, id: '', data: d, content: p.content, page: true });
  const dir = d.sections_dir || fileBase;
  for (const name of d.sections || []) {
    const rel = `${dir}/${name}.md`;
    if (!fs.existsSync(path.join(CONTENT, rel)))
      throw new Error(`Section file not found: content/${rel}`);
    const loaded = load(rel);
    parts.push({ rel, id: slugify(name), data: loaded.data as ComponentData, content: String(loaded.content), page: false });
  }
  const bands = parts.map((part, index) => {
    const type = typeof part.data.type === 'string' && part.data.type ? part.data.type : 'text';
    const component = COMPONENTS[type];
    if (!component)
      throw new Error(
        `content/${part.rel}: unknown type "${type}". Available types: ${Object.keys(COMPONENTS).join(', ')}`,
      );
    let inner: string;
    try {
      inner = component(part.data, part.content, { ...ctx, page: part.page });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        message.startsWith('content/') ? message : `content/${part.rel}: ${message}`,
      );
    }
    const id = part.id ? ` id="${part.id}"` : '';
    return `<section class="band reveal${index % 2 ? ' tint' : ''}"${id}><div class="wrap">${inner}</div></section>`;
  });

  let head = banner(d);
  if (d.hero_title) {
    const buttons = (d.hero_buttons || [])
      .map((button: { url: string; label: string }, index: number) => `<a class="btn${index ? ' ghost' : ''}" href="${esc(button.url)}">${esc(button.label)}</a>`)
      .join(' ');
    const hasImg = typeof d.hero_image === 'string' && d.hero_image && fs.existsSync(path.join(ASSETS, 'imgs', d.hero_image));
    if (typeof d.hero_image === 'string' && d.hero_image && !hasImg) missingImages.add(d.hero_image);
    const hasVideo = typeof d.hero_video === 'string' && d.hero_video && fs.existsSync(path.join(ASSETS, 'vids', d.hero_video));
    if (typeof d.hero_video === 'string' && d.hero_video && !hasVideo) missingHeroVideos.add(d.hero_video);
    const bg = hasImg && typeof d.hero_image === 'string' ? ` style="--hero-img:url('/imgs/${esc(d.hero_image)}')"` : '';
    const video = hasVideo && typeof d.hero_video === 'string'
      ? `<video class="hero-video" src="/vids/${esc(d.hero_video)}" autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1"></video>`
      : '';
    head += `<section class="hero${hasImg ? ' has-image' : ''}${hasVideo ? ' has-video' : ''}"${bg}>${video}<div class="wrap"><h1>${esc(d.hero_title)}</h1>${d.hero_text ? `<p>${esc(d.hero_text)}</p>` : ''}${buttons ? `<p>${buttons}</p>` : ''}</div></section>`;
  } else if (d.title && d.show_title !== false) {
    head += `<div class="wrap page-head"><h1>${esc(d.title)}</h1></div>`; // the page title is the <h1>
  }
  const html = head + bands.join('\n');
  // Any page with viewer links (gallery pictures, video thumbnails) gets the viewer markup + script.
  if (html.includes('data-viewer=')) ctx.features.add('lightbox');
  return { html, jsonld: ctx.jsonld, features: ctx.features };
}
