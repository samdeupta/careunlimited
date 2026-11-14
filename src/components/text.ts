// type: text (plain writing, optionally beside a picture) and type: list (ticked bullet points).
import { esc } from '../util';
import { imgTag } from '../images';
import { md } from '../markdown';
import type { ComponentContext, ComponentData } from '../types';

export function text(
  d: ComponentData,
  content: string,
  ctx: ComponentContext,
  { list = false }: { list?: boolean } = {},
): string {
  const fig = d.image ? imgTag(d.image, d.image_alt || d.title || '') : '';
  const cta = d.cta ? `<p><a class="btn" href="${esc(d.cta.url)}">${esc(d.cta.label)}</a></p>` : '';
  const h = d.title && !ctx.page ? `<h2>${esc(d.title)}</h2>` : '';
  const copy = `<div class="copy${list ? ' checklist' : ''}">${h}${md(content)}${cta}</div>`;
  if (!fig) return `<div class="single">${copy}</div>`;
  return `<div class="split${d.image_position === 'left' ? ' reverse' : ''}">${copy}<figure>${fig}</figure></div>`;
}

export const list = (d: ComponentData, content: string, ctx: ComponentContext): string => text(d, content, ctx, { list: true });
