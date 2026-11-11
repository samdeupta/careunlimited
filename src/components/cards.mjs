// type: cards. A grid of boxes, one per heading.
import { esc, slugify } from '../util.mjs';
import { imgTag } from '../images.mjs';
import { md, extract, splitByHeading } from '../markdown.mjs';
import { top } from './common.mjs';

/** A grid of cards, one per heading. Optional per card: a picture line, an _italic_ subtitle line, a link line. */
export function cards(d, content, ctx) {
  const { intro, blocks } = splitByHeading(content);
  const cols = Math.min(4, Math.max(1, Number(d.columns) || 3));
  const items = blocks
    .map((b) => {
      const x = extract(b.body);
      const pic = x.image ? imgTag(x.image.src, x.image.alt || b.title) : '';
      return (
        `<article class="card" id="${slugify(b.title)}">${pic}<h3>${esc(b.title)}</h3>` +
        `${x.subtitle ? `<p class="sub">${esc(x.subtitle)}</p>` : ''}${md(x.text)}` +
        `${x.link ? `<a class="more" href="${esc(x.link.url)}">${esc(x.link.label)} →</a>` : ''}</article>`
      );
    })
    .join('');
  return `${top(d, ctx, intro)}<div class="grid cols-${cols}">${items}</div>`;
}
