import { marked } from 'marked';
import { site } from './content';
import { unesc } from './util';
import { imgTag } from './images';
import { warnings } from './warnings';
import { ytId, vimeoId, videoEmbed, isLocalVideo } from './video';
import type { ExtractedMarkdown, MarkdownBlock, MarkdownSplitResult } from './types';

function vars(src: string | undefined): string {
  return String(src ?? '').replace(
    /\{\{\s*site\.(\w+)\s*(?:\|\s*(\w+)\s*)?\}\}/g,
    (match: string, key: string, filter: string | undefined): string => {
      if (!(key in site)) {
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

export function md(src: string): string {
  const tokens = marked.lexer(vars(src).replace(/<!--[\s\S]*?-->/g, ''));
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'paragraph') {
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
      Object.assign(token, { type: 'html', text: imgTag(token.href, unesc(token.text)), tokens: undefined });
    }
  });
  return String(marked.parser(tokens));
}

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

export function splitByHeading(body: string): MarkdownSplitResult {
  const has = (level: string): boolean => {
    const inFence = fenceTracker();
    return body.split('\n').some((line) => !inFence(line) && line.startsWith(level));
  };
  for (const level of ['## ', '### ', '#### ']) if (has(level)) return splitSections(body, level);
  return { intro: body.trim(), blocks: [] };
}
