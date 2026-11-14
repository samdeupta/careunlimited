// Markdown handling: converting text to HTML, and cutting text into headed blocks.
import { marked } from 'marked';
import { site } from './content';
import { unesc } from './util';
import { imgTag } from './images';
import { ytId, vimeoId, videoEmbed } from './video';
import type { ExtractedMarkdown, MarkdownBlock, MarkdownSplitResult } from './types';

/** {{ site.phone }} -> value from content/site.md (lists are joined with line breaks). Filter: `| digits` removes spaces. */
function vars(src: string | undefined): string {
  return String(src ?? '').replace(
    /\{\{\s*site\.(\w+)\s*(?:\|\s*(\w+)\s*)?\}\}/g,
    (match: string, key: string, filter: string | undefined): string => {
      if (!(key in site)) throw new Error(`${match} is not defined in content/site.md`);
      const siteValue = site[key as keyof typeof site];
      let value = Array.isArray(siteValue) ? siteValue.join('  \n') : String(siteValue ?? '');
      if (filter === 'digits') return value.replace(/\s+/g, '');
      if (filter) throw new Error(`unknown filter "${filter}" in ${match} (only "digits" exists)`);
      return value;
    },
  );
}

/** Markdown -> HTML, with {{ placeholders }} filled in, local images resolved against assets/img and videos turned into players. */
export function md(src: string): string {
  let html = String(marked.parse(vars(src).replace(/<!--[\s\S]*?-->/g, '')));
  // ![caption](vid/file.mp4) on its own line -> local <video> player
  html = html.replace(
    /<p><img src="([^"]+\.(?:mp4|webm|ogv))" alt="([^"]*)"[^>]*><\/p>/gi,
    (_match: string, s: string, a: string) => videoEmbed(unesc(s), { title: unesc(a) }),
  );
  // a bare YouTube / Vimeo URL on its own line (an autolink) -> click-to-play embed
  html = html.replace(/<p><a href="([^"]+)">([^<]+)<\/a><\/p>/g, (match: string, href: string, text: string) => {
    const unescapedHref = unesc(href);
    return unescapedHref === unesc(text) && (ytId(unescapedHref) || vimeoId(unescapedHref)) ? videoEmbed(unescapedHref) : match;
  });
  return html.replace(/<img src="([^"]*)" alt="([^"]*)"[^>]*>/g, (_match: string, s: string, a: string) => imgTag(s, unesc(a)));
}

/** Split markdown at headings of a given level ("## "). Returns the intro text and the blocks. */
export function splitSections(body: string, level: string): MarkdownSplitResult {
  const intro: string[] = [];
  const blocks: Array<{ title: string; lines: string[] }> = [];
  let cur: { title: string; lines: string[] } | null = null;
  let fence = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) fence = !fence;
    if (!fence && line.startsWith(level)) {
      cur = { title: line.slice(level.length).trim(), lines: [] };
      blocks.push(cur);
    } else if (cur) {
      cur.lines.push(line);
    } else {
      intro.push(line);
    }
  }
  return {
    intro: intro.join('\n').trim(),
    blocks: blocks.map((b): MarkdownBlock => ({ title: b.title, body: b.lines.join('\n').trim() })),
  };
}

/** Pull a standalone image line, a standalone link line and an _italic_ line out of a block of markdown. */
export function extract(body: string): ExtractedMarkdown {
  let image: { alt: string; src: string } | null = null;
  let link: { label: string; url: string } | null = null;
  let subtitle: string | null = null;
  const keep: string[] = [];
  for (const line of body.split('\n')) {
    const t = line.trim();
    let match: RegExpMatchArray | null;
    if (!image && (match = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/))) {
      image = { alt: match[1], src: match[2] };
      continue;
    }
    if (!link && (match = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/))) {
      link = { label: match[1], url: match[2] };
      continue;
    }
    if (!subtitle && (match = t.match(/^(?:_([^_].*)_|\*([^*].*)\*)$/))) {
      subtitle = match[1] ?? match[2] ?? null;
      continue;
    }
    keep.push(line);
  }
  return { image, link, subtitle, text: keep.join('\n').trim() };
}

/** Split markdown at the shallowest heading level it uses (## , else ### , else ####). */
export function splitByHeading(body: string): MarkdownSplitResult {
  const has = (level: string): boolean => {
    let fence = false;
    for (const line of body.split('\n')) {
      if (line.startsWith('```')) fence = !fence;
      if (!fence && line.startsWith(level)) return true;
    }
    return false;
  };
  for (const level of ['## ', '### ', '#### ']) if (has(level)) return splitSections(body, level);
  return { intro: body.trim(), blocks: [] };
}
