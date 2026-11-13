// type: gallery. Picture groups that open in the full-screen viewer (features.mjs).
import { esc, slugify } from '../util.mjs';
import { imgTag } from '../images.mjs';
import { splitByHeading } from '../markdown.mjs';
import { top } from './common.mjs';

/** Picture groups (one per heading) that open in a full-screen viewer with previous/next buttons. */
export function gallery(d, content, ctx) {
  const { intro, blocks } = splitByHeading(content);
  const groups = blocks.length ? blocks : [{ title: '', body: intro }];
  const h = ctx.page ? 'h2' : 'h3';
  const html = groups
    .map((g) => {
      const imgs = [...g.body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)]
        .map((m) => {
          const alt = m[1] || g.title;
          const tag = imgTag(m[2], alt);
          const href = /^https?:\/\//.test(m[2]) ? m[2] : `/imgs/${m[2].replace(/^\/?imgs\//, '')}`;
          return tag
            ? `<a href="${esc(href)}" data-viewer="image" data-group="${esc(g.title)}" data-alt="${esc(alt)}">${tag}</a>`
            : '';
        })
        .join('');
      const id = g.title ? ` id="${slugify(g.title)}"` : '';
      const title = g.title ? `<${h}>${esc(g.title)}</${h}>` : '';
      return `<section class="gallery-group reveal"${id}>${title}<div class="gallery" data-viewer-group>${imgs}</div></section>`;
    })
    .join('');
  return `${top(d, ctx, blocks.length ? intro : '')}${html}`;
}
