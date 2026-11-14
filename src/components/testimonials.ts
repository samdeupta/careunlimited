// type: testimonials. Quote cards: heading = name, optional _subtitle_ and picture lines, the rest is the quotation.
import { esc } from '../util';
import { imgTag } from '../images';
import { md, extract, splitByHeading } from '../markdown';
import { top } from './common';
import type { ComponentContext, ComponentData } from '../types';

/** Quote cards: heading = name; optional _subtitle_ line and picture line; the rest is the quotation. */
export function testimonials(d: ComponentData, content: string, ctx: ComponentContext): string {
  const { intro, blocks } = splitByHeading(content);
  const cardsHtml = blocks
    .map((b) => {
      const x = extract(b.body);
      const photo = x.image ? imgTag(x.image.src, b.title, 'avatar') : '';
      return (
        `<figure class="card quote reveal"><blockquote>${md(x.text)}</blockquote><figcaption>${photo}` +
        `<span><strong>${esc(b.title)}</strong>${x.subtitle ? `<br><small>${esc(x.subtitle)}</small>` : ''}</span></figcaption></figure>`
      );
    })
    .join('');
  return `${top(d, ctx, intro)}<div class="grid cols-2">${cardsHtml}</div>`;
}
