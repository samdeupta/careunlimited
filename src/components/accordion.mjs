// type: accordion. Click-to-open question/answer list.
import { esc, slugify } from '../util.mjs';
import { md, splitByHeading } from '../markdown.mjs';
import { top } from './common.mjs';

/** Click-to-open question/answer list, one per heading. `schema: faq` also adds search-engine FAQ data. */
export function accordion(d, content, ctx) {
  const { intro, blocks } = splitByHeading(content);
  if (d.schema === 'faq')
    ctx.jsonld.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: blocks.map((b) => ({
        '@type': 'Question',
        name: b.title,
        acceptedAnswer: { '@type': 'Answer', text: b.body.replace(/[*_`#]/g, '') },
      })),
    });
  const items = blocks
    .map(
      (b) =>
        `<details id="${slugify(b.title)}"><summary>${esc(b.title)}</summary><div class="answer">${md(b.body)}</div></details>`,
    )
    .join('');
  return `${top(d, ctx, intro)}<div class="accordion">${items}</div>`;
}
