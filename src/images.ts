// Turning an image name from content into HTML or a URL. Missing files are skipped and recorded.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS } from './config';
import { esc } from './util';
import { missingImages } from './missing';

/** <img> for a file in assets/imgs (or an absolute URL). Silently skipped (with a warning) if the file is missing. */
export function imgTag(name: string | undefined, alt = '', cls = ''): string {
  if (!name) return '';
  const c = cls ? ` class="${cls}"` : '';
  if (/^https?:\/\//.test(name))
    return `<img src="${esc(name)}" alt="${esc(alt)}"${c} loading="lazy">`;
  const n = String(name).replace(/^\/?imgs\//, '');
  if (!fs.existsSync(path.join(ASSETS, 'imgs', n))) {
    missingImages.add(n);
    return '';
  }
  return `<img src="/imgs/${esc(n)}" alt="${esc(alt)}"${c} loading="lazy">`;
}

/** Resolve an image name (in assets/imgs) to a URL, or '' if the file is missing. */
export function imgUrl(name: string | undefined): string {
  if (!name) return '';
  if (/^https?:\/\//.test(name)) return name;
  const n = String(name).replace(/^\/?imgs\//, '');
  if (!fs.existsSync(path.join(ASSETS, 'imgs', n))) {
    missingImages.add(n);
    return '';
  }
  return `/imgs/${n}`;
}
