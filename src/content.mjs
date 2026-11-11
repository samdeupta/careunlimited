// Reading content files: one function to load a Markdown file (settings + text), and the site-wide settings.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { CONTENT } from './config.mjs';

export const load = (rel) => {
  try {
    return matter(fs.readFileSync(path.join(CONTENT, rel), 'utf8'));
  } catch (e) {
    // Name the file (and the line in it) so a typo in the settings block is easy to find.
    const line = e.mark ? `, line ${e.mark.line + 1}` : ''; // mark.line is 0-based and the YAML text starts right after the opening ---
    const reason = String(e.reason || e.message)
      .split('\n')[0]
      .replace(/:$/, '');
    throw new Error(`content/${rel}${line}: ${reason}. Check the settings between the --- lines.`);
  }
};

/** Site-wide settings from content/site.md (name, nav, address, ...). */
export const site = load('site.md').data;
