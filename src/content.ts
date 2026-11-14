import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { CONTENT } from './config';
import { normalizeSiteData } from './schema';
import type { SiteData } from './types';

export const load = (rel: string) => {
  try {
    return matter(fs.readFileSync(path.join(CONTENT, rel), 'utf8'));
  } catch (error: unknown) {
    const err = error as { mark?: { line?: number }; reason?: string; message?: string };
    const line = err.mark?.line !== undefined ? `, line ${err.mark.line + 1}` : ''; // mark.line is 0-based and the YAML text starts right after the opening ---
    const reason = String(err.reason ?? err.message ?? 'Unknown error')
      .split('\n')[0]
      .replace(/:$/, '');
    throw new Error(`content/${rel}${line}: ${reason}. Check the settings between the --- lines.`);
  }
};

export const site: SiteData = normalizeSiteData('site.md', load('site.md').data);
