// Video: recognising YouTube / Vimeo / local-file addresses and building the player HTML.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS } from './config';
import { esc } from './util';
import { imgTag, imgUrl } from './images';
import { missingVideos } from './missing';

const YT_HOST = /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\//;
export const ytId = (u = ''): string | undefined => {
  if (!YT_HOST.test(u)) return undefined;
  const match =
    u.match(/[?&]v=([\w-]{6,})/) ||
    u.match(/youtu\.be\/([\w-]{6,})/) ||
    u.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/);
  return match?.[1];
};
export const vimeoId = (u = ''): string | undefined => u.match(/vimeo\.com\/(?:video\/)?(\d{5,})/)?.[1];
const LOCAL_VIDEO = /\.(mp4|webm|ogv)$/i;
export const isLocalVideo = (u = ''): boolean => LOCAL_VIDEO.test(u) && !/^[a-z][a-z0-9+.-]*:/i.test(u);

/**
 * A video thumbnail for: a YouTube / Vimeo URL or a local file in assets/vid. Clicking it opens the video in the shared
 * viewer (features.ts), so the player (and any cookies or tracking that come with it) only loads after a click; the
 * YouTube thumbnail image itself is still fetched on page load.
 * Returns '' for anything else.
 */
export function videoEmbed(
  url: string,
  { title = '', poster = '' }: { title?: string; poster?: string } = {},
): string {
  const label = esc(title || 'Video');
  const yt = ytId(url);
  const vm = vimeoId(url);
  if (yt || vm) {
    const match = url.match(/[?&](?:t|start)=(\d+)/);
    const t = match?.[1] ?? '';
    const src = yt
      ? `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0${t ? `&start=${t}` : ''}`
      : `https://player.vimeo.com/video/${vm}?autoplay=1&dnt=1`;
    const thumb = poster || (yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : '');
    const img = thumb ? imgTag(thumb, '') : '';
    return (
      `<div class="video-embed${img ? '' : ' no-thumb'}">` +
      `<a class="thumb" href="${esc(url)}" rel="noopener" data-viewer="embed" data-src="${esc(src)}" data-title="${esc(title)}" aria-label="Play video: ${label}">${img}${PLAY_ICON}</a></div>`
    );
  }
  if (isLocalVideo(url)) {
    const name = url.replace(/^\/?(?:vid\/)?/, '');
    if (!fs.existsSync(path.join(ASSETS, 'vid', name))) {
      missingVideos.add(name);
      return '';
    }
    const typeMap: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg' };
    const extension = name.split('.').pop()?.toLowerCase() ?? '';
    const type = typeMap[extension] ?? '';
    const pu = poster ? imgUrl(poster) : '';
    const file = `/vid/${esc(name)}`;
    // Thumbnail: the poster picture if there is one (nothing is downloaded), else the video's first frame (#t=0.1).
    // Clicking opens the viewer.
    const thumb = pu
      ? `<video muted playsinline preload="none" tabindex="-1" aria-hidden="true" poster="${esc(pu)}" src="${file}"></video>`
      : `<video muted playsinline preload="metadata" tabindex="-1" aria-hidden="true" src="${file}#t=0.1"></video>`;
    return (
      `<div class="video-embed is-local"><a class="thumb" href="${file}" data-viewer="video" data-src="${file}" data-type="${type}" data-title="${esc(title)}" aria-label="Play video: ${label}">` +
      `${thumb}${PLAY_ICON}</a></div>`
    );
  }
  return '';
}
const PLAY_ICON =
  '<span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 5.5v13l10-6.5z"/></svg></span>';
