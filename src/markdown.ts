// Markdown handling: converting text to HTML, and cutting text into headed blocks.
import { marked } from 'marked';
import { site } from './content';
import { unesc } from './util';
import { imgTag } from './images';
import { warnings } from './warnings';
import { ytId, vimeoId, videoEmbed, isLocalVideo } from './video';
import type { ExtractedMarkdown, MarkdownBlock, MarkdownSplitResult } from './types';

/** {{ site.phone }} -> value from content/site.md (lists are joined with line breaks). Filter: `| digits` removes spaces. */
function vars(src: string | undefined): string {
  return String(src ?? '').replace(
    /\{\{\s*site\.(\w+)\s*(?:\|\s*(\w+)\s*)?\}\}/g,
    (match: string, key: string, filter: string | undefined): string => {
      if (!(key in site)) {
        // A setting that was rejected (e.g. a phone number written without quotes) is "not defined" too; say why.
        const why = warnings.filter((w) => w.startsWith('content/site.md:'));
        throw new Error(`${match} is not defined in content/site.md${why.length ? ` (${why.join(' ')})` : ''}`);
      }
      const siteValue = site[key as keyof typeof site];
      let value = Array.isArray(siteValue) ? siteValue.join('  \n') : String(siteValue ?? '');
      if (filter === 'digits') return value.replace(/\s+/g, '');
      if (filter) throw new Error(`unknown filter "${filter}" in ${match} (only "digits" exists)`);
      return value;
    },
  );
}

/** Markdown -> HTML, with {{ placeholders }} filled in, local images resolved against assets/imgs and videos turned into players. */
export function md(src: string): string {
  // Work on marked's token tree (lexer -> parser) rather than patching the HTML it writes, so a change in how a
  // marked release formats <img> or <p> cannot silently break image and video handling.
  const tokens = marked.lexer(vars(src).replace(/<!--[\s\S]*?-->/g, ''));
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'paragraph') {
      // A paragraph that is only a picture line pointing at a video file (![caption](file.mp4)) -> local <video> player;
      // or only a bare YouTube / Vimeo address (an autolink) -> click-to-play embed.
      const only = token.tokens?.length === 1 ? token.tokens[0] : undefined;
      let html = '';
      if (only?.type === 'image' && isLocalVideo(only.href)) {
        html = videoEmbed(unesc(only.href), { title: unesc(only.text) });
      } else if (only?.type === 'link' && unesc(only.href) === unesc(only.text)) {
        const url = unesc(only.href);
        if (ytId(url) || vimeoId(url)) html = videoEmbed(url);
      }
      if (html) Object.assign(token, { type: 'html', block: true, text: html, tokens: undefined });
    } else if (token.type === 'image') {
      // Every other picture: resolved against assets/imgs (skipped and recorded if the file is missing).
      Object.assign(token, { type: 'html', text: imgTag(token.href, unesc(token.text)), tokens: undefined });
    }
  });
  return String(marked.parser(tokens));
}

/**
 * Remembers whether we are inside a fenced code block, for code that reads Markdown line by line.
 * Handles ``` and ~~~ fences (up to 3 spaces of indent); a fence ends at a line of the same character, at least as long.
 * Call it once per line, in order. It returns true for the lines inside a fence and for the fence lines themselves.
 */
function fenceTracker(): (line: string) => boolean {
  let open: { char: string; length: number } | null = null;
  return (line: string): boolean => {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
    if (open) {
      if (fence && fence[0] === open.char && fence.length >= open.length && /^ {0,3}[`~]+\s*$/.test(line)) open = null;
      return true;
    }
    if (fence) {
      open = { char: fence[0], length: fence.length };
      return true;
    }
    return false;
  };
}

/** Split markdown at headings of a given level ("## "). Returns the intro text and the blocks. */
export function splitSections(body: string, level: string): MarkdownSplitResult {
  const intro: string[] = [];
  const blocks: Array<{ title: string; lines: string[] }> = [];
  let cur: { title: string; lines: string[] } | null = null;
  const inFence = fenceTracker();
  for (const line of body.split('\n')) {
    if (!inFence(line) && line.startsWith(level)) {
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

/**
 * Pull a standalone image line, a standalone link line and an _italic_ line out of a block of markdown.
 * Only the FIRST of each kind is taken (a second one stays in the text and is rendered where it is), and lines
 * inside a code fence are never taken.
 */
export function extract(body: string): ExtractedMarkdown {
  let image: { alt: string; src: string } | null = null;
  let link: { label: string; url: string } | null = null;
  let subtitle: string | null = null;
  const keep: string[] = [];
  const inFence = fenceTracker();
  for (const line of body.split('\n')) {
    if (inFence(line)) {
      keep.push(line);
      continue;
    }
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
    const inFence = fenceTracker();
    return body.split('\n').some((line) => !inFence(line) && line.startsWith(level));
  };
  for (const level of ['## ', '### ', '#### ']) if (has(level)) return splitSections(body, level);
  return { intro: body.trim(), blocks: [] };
}
