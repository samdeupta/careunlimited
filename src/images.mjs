// Turning an image name from content into HTML or a URL. Missing files are skipped and recorded.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS } from './config.mjs';
import { esc } from './util.mjs';
import { missingImages } from './missing.mjs';

/** <img> for a file in assets/imgs (or an absolute URL). Silently skipped (with a warning) if the file is missing. */
export function imgTag(name, alt = '', cls = '') {
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
export function imgUrl(name) {
  if (!name) return '';
  if (/^https?:\/\//.test(name)) return name;
  const n = String(name).replace(/^\/?imgs\//, '');
  if (!fs.existsSync(path.join(ASSETS, 'imgs', n))) {
    missingImages.add(n);
    return '';
  }
  return `/imgs/${n}`;
}
