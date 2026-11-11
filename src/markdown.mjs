// Markdown handling: converting text to HTML, and cutting text into headed blocks.
import { marked } from 'marked';
import { site } from './content.mjs';
import { unesc } from './util.mjs';
import { imgTag } from './images.mjs';
import { ytId, vimeoId, videoEmbed } from './video.mjs';

/** {{ site.phone }} -> value from content/site.md (lists are joined with line breaks). Filter: `| digits` removes spaces. */
function vars(src) {
  return String(src ?? '').replace(
    /\{\{\s*site\.(\w+)\s*(?:\|\s*(\w+)\s*)?\}\}/g,
    (m, key, filter) => {
      if (!(key in site)) throw new Error(`${m} is not defined in content/site.md`);
      let v = site[key];
      v = Array.isArray(v) ? v.join('  \n') : String(v);
      if (filter === 'digits') return v.replace(/\s+/g, '');
      if (filter) throw new Error(`unknown filter "${filter}" in ${m} (only "digits" exists)`);
      return v;
    },
  );
}

/** Markdown -> HTML, with {{ placeholders }} filled in, local images resolved against assets/img and videos turned into players. */
export function md(src) {
  let html = marked.parse(vars(src).replace(/<!--[\s\S]*?-->/g, ''));
  // ![caption](vid/file.mp4) on its own line -> local <video> player
  html = html.replace(
    /<p><img src="([^"]+\.(?:mp4|webm|ogv))" alt="([^"]*)"[^>]*><\/p>/gi,
    (_, s, a) => videoEmbed(unesc(s), { title: unesc(a) }),
  );
  // a bare YouTube / Vimeo URL on its own line (an autolink) -> click-to-play embed
  html = html.replace(/<p><a href="([^"]+)">([^<]+)<\/a><\/p>/g, (m, h, t) => {
    const u = unesc(h);
    return u === unesc(t) && (ytId(u) || vimeoId(u)) ? videoEmbed(u) : m;
  });
  return html.replace(/<img src="([^"]*)" alt="([^"]*)"[^>]*>/g, (_, s, a) => imgTag(s, unesc(a)));
}

/** Split markdown at headings of a given level ("## "). Returns the intro text and the blocks. */
export function splitSections(body, level) {
  const intro = [];
  const blocks = [];
  let cur = null;
  let fence = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) fence = !fence;
    if (!fence && line.startsWith(level)) {
      cur = { title: line.slice(level.length).trim(), lines: [] };
      blocks.push(cur);
    } else (cur ? cur.lines : intro).push(line);
  }
  return {
    intro: intro.join('\n').trim(),
    blocks: blocks.map((b) => ({ title: b.title, body: b.lines.join('\n').trim() })),
  };
}

/** Pull a standalone image line, a standalone link line and an _italic_ line out of a block of markdown. */
export function extract(body) {
  let image = null,
    link = null,
    subtitle = null;
  const keep = [];
  for (const line of body.split('\n')) {
    const t = line.trim();
    let m;
    if (!image && (m = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/))) {
      image = { alt: m[1], src: m[2] };
      continue;
    }
    if (!link && (m = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/))) {
      link = { label: m[1], url: m[2] };
      continue;
    }
    if (!subtitle && (m = t.match(/^(?:_([^_].*)_|\*([^*].*)\*)$/))) {
      subtitle = m[1] ?? m[2];
      continue;
    }
    keep.push(line);
  }
  return { image, link, subtitle, text: keep.join('\n').trim() };
}

/** Split markdown at the shallowest heading level it uses (## , else ### , else ####). */
export function splitByHeading(body) {
  const has = (level) => {
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
