import fs from 'node:fs';
import path from 'node:path';
import { ASSETS } from './config';
import { esc } from './util';
import { missingImages } from './missing';

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
