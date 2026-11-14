// type: index. Links to every heading of another content page (`source:`), plus a button to that page.
import path from 'node:path';
import { esc, slugify } from '../util';
import { load } from '../content';
import { splitByHeading } from '../markdown';
import { top } from './common';
import type { ComponentContext, ComponentData } from '../types';

/** Links to every heading of another content page (`source:`), plus a button to that page. */
export function index(d: ComponentData, content: string, ctx: ComponentContext): string {
  if (!d.source)
    throw new Error('type "index" needs a source: setting, e.g. source: other-page.md');
  const src = load(d.source);
  const sourceData = src.data as Record<string, unknown>;
  const slug = typeof sourceData.slug === 'string' && sourceData.slug ? sourceData.slug : path.basename(d.source, '.md');
  const base = slug ? `/${slug}/` : '/';
  const chips = splitByHeading(src.content)
    .blocks.map((b) => `<li><a href="${base}#${slugify(b.title)}">${esc(b.title)}</a></li>`)
    .join('');
  return (
    `${top(d, ctx, content)}<ul class="chips">${chips}</ul>` +
    `<p class="center"><a class="btn" href="${base}">${esc(d.cta_label || 'Read more')}</a></p>`
  );
}
