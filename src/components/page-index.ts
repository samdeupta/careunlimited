// type: index. Links to every heading of another content page (`source:`), plus a button to that page.
import path from 'node:path';
import { esc, slugify } from '../util.mjs';
import { load } from '../content.mjs';
import { splitByHeading } from '../markdown.mjs';
import { top } from './common.mjs';

/** Links to every heading of another content page (`source:`), plus a button to that page. */
export function index(d, content, ctx) {
  if (!d.source)
    throw new Error('type "index" needs a source: setting, e.g. source: other-page.md');
  const src = load(d.source);
  const slug = src.data.slug ?? path.basename(d.source, '.md');
  const base = slug ? `/${slug}/` : '/';
  const chips = splitByHeading(src.content)
    .blocks.map((b) => `<li><a href="${base}#${slugify(b.title)}">${esc(b.title)}</a></li>`)
    .join('');
  return (
    `${top(d, ctx, content)}<ul class="chips">${chips}</ul>` +
    `<p class="center"><a class="btn" href="${base}">${esc(d.cta_label || 'Read more')}</a></p>`
  );
}
