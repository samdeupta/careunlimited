// type: text (plain writing, optionally beside a picture) and type: list (ticked bullet points).
import { esc } from '../util.mjs';
import { imgTag } from '../images.mjs';
import { md } from '../markdown.mjs';

export function text(d, content, ctx, { list = false } = {}) {
  const fig = d.image ? imgTag(d.image, d.image_alt || d.title || '') : '';
  const cta = d.cta ? `<p><a class="btn" href="${esc(d.cta.url)}">${esc(d.cta.label)}</a></p>` : '';
  const h = d.title && !ctx.page ? `<h2>${esc(d.title)}</h2>` : '';
  const copy = `<div class="copy${list ? ' checklist' : ''}">${h}${md(content)}${cta}</div>`;
  if (!fig) return `<div class="single">${copy}</div>`;
  return `<div class="split${d.image_position === 'left' ? ' reverse' : ''}">${copy}<figure>${fig}</figure></div>`;
}

export const list = (d, content, ctx) => text(d, content, ctx, { list: true });
