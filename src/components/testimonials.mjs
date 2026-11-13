// type: testimonials. Quote cards: heading = name, optional _subtitle_ and picture lines, the rest is the quotation.
import { esc } from '../util.mjs';
import { imgTag } from '../images.mjs';
import { md, extract, splitByHeading } from '../markdown.mjs';
import { top } from './common.mjs';

/** Quote cards: heading = name; optional _subtitle_ line and picture line; the rest is the quotation. */
export function testimonials(d, content, ctx) {
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
