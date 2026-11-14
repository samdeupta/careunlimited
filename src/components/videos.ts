// type: videos. Cards that play a video (YouTube / Vimeo address, or a file in assets/vid) in the shared viewer;
// the videos in one row can be stepped through with its previous/next buttons.
import { esc } from '../util';
import { md, extract, splitByHeading } from '../markdown';
import { videoEmbed, isLocalVideo } from '../video';
import { top } from './common';
import type { ComponentContext, ComponentData } from '../types';

/** Cards that play a video: a YouTube/Vimeo address or a file in assets/vid on each card's link line. */
export function videos(d: ComponentData, content: string, ctx: ComponentContext): string {
  const { intro, blocks } = splitByHeading(content);
  const cardsHtml = blocks
    .map((b) => {
      const x = extract(b.body);
      const url = x.link?.url;
      const player = url ? videoEmbed(url, { title: b.title, poster: x.image?.src }) : '';
      const watch =
        x.link && url && !isLocalVideo(url)
          ? `<a class="more" href="${esc(url)}" rel="noopener">${esc(x.link.label)} →</a>`
          : '';
      return `<article class="card video reveal">${player}<h3>${esc(b.title)}</h3>${md(x.text)}${watch}</article>`;
    })
    .join('');
  const chan = d.channel
    ? `<p class="center"><a class="btn" href="${esc(d.channel)}" rel="noopener">Visit our YouTube channel</a></p>`
    : '';
  return `${top(d, ctx, intro)}<div class="grid cols-3" data-viewer-group>${cardsHtml}</div>${chan}`;
}
