import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS } from '../src/config';
import { site } from '../src/content';
import { md, splitSections, splitByHeading, extract } from '../src/markdown';
import { missingImages, missingVideos } from '../src/missing';

function someImage(): string {
  const walk = (dir: string, rel = ''): string | undefined => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const found = walk(path.join(dir, entry.name), `${rel}${entry.name}/`);
        if (found) return found;
      } else if (/\.(jpe?g|png|webp|gif|svg|avif)$/i.test(entry.name)) return `${rel}${entry.name}`;
    }
    return undefined;
  };
  const found = walk(path.join(ASSETS, 'imgs'));
  assert.ok(found, 'assets/imgs has no image to test with');
  return found;
}

beforeEach(() => {
  missingImages.clear();
  missingVideos.clear();
});

test('a picture becomes an <img> pointing into /imgs, with its caption as alt text', () => {
  const img = someImage();
  const html = md(`![Tom & Jerry](${img})`);
  assert.match(html, new RegExp(`<img src="/imgs/${img.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" alt="Tom &amp; Jerry"`));
});

test('pictures inside lists and inside links are handled too', () => {
  const img = someImage();
  assert.match(md(`- item ![a](${img})`), /<li>[\s\S]*<img src="\/imgs\//);
  assert.match(md(`[![a](${img})](https://example.org)`), /<a href="https:\/\/example.org"><img src="\/imgs\//);
});

test('a picture that does not exist is skipped and recorded, not left as a broken <img>', () => {
  const html = md('![x](definitely-not-here.jpg)');
  assert.doesNotMatch(html, /<img/);
  assert.ok(missingImages.has('definitely-not-here.jpg'));
});

test('a YouTube address alone on its line becomes a click-to-play embed', () => {
  const html = md('https://youtu.be/dQw4w9WgXcQ?t=90&x=1');
  assert.match(html, /data-viewer="embed"/);
  assert.match(html, /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?autoplay=1&amp;rel=0&amp;start=90/);
  assert.doesNotMatch(html, /<p><a href/);
});

test('a YouTube address inside a sentence stays an ordinary link', () => {
  const html = md('Watch https://youtu.be/dQw4w9WgXcQ today');
  assert.doesNotMatch(html, /data-viewer/);
  assert.match(html, /<a href="https:\/\/youtu.be\/dQw4w9WgXcQ"/);
});

test('a link whose text differs from its address is not turned into a player', () => {
  assert.doesNotMatch(md('[our video](https://youtu.be/dQw4w9WgXcQ)'), /data-viewer/);
});

test('a video file on its own line is looked up, and recorded when missing', () => {
  const html = md('![A caption](nope.mp4)');
  assert.doesNotMatch(html, /<img/);
  assert.ok(missingVideos.has('nope.mp4'));
});

test('{{ site.x }} placeholders are filled in; unknown ones fail loudly', () => {
  if (site.phone) assert.ok(md('{{ site.phone | digits }}').includes(site.phone.replace(/\s+/g, '')));
  assert.throws(() => md('{{ site.nope }}'), /not defined in content\/site\.md/);
  assert.throws(() => md('{{ site.name | shout }}'), /unknown filter/);
});

test('HTML comments are dropped', () => {
  assert.doesNotMatch(md('hello <!-- secret --> world'), /secret/);
});

test('splitSections ignores headings inside ``` and ~~~ code fences', () => {
  const body = ['intro', '## One', 'a', '```', '## not a heading', '```', '## Two', '~~~', '## nor this', '~~~', 'b'].join('\n');
  const { intro, blocks } = splitSections(body, '## ');
  assert.equal(intro, 'intro');
  assert.deepEqual(blocks.map((b) => b.title), ['One', 'Two']);
  assert.match(blocks[0].body, /## not a heading/);
  assert.match(blocks[1].body, /## nor this/);
});

test('a longer fence is not closed by a shorter one', () => {
  const body = ['## One', '````', '```', '## inside', '```', '````', '## Two'].join('\n');
  assert.deepEqual(splitSections(body, '## ').blocks.map((b) => b.title), ['One', 'Two']);
});

test('splitByHeading picks the shallowest level in use, ignoring fenced ones', () => {
  const body = ['```', '## fake', '```', '### Real', 'x'].join('\n');
  assert.deepEqual(splitByHeading(body).blocks.map((b) => b.title), ['Real']);
});

test('extract takes the first picture, link and _italic_ line, leaving the rest as text', () => {
  const x = extract(['![alt](a.jpg)', '_Subtitle_', '[Read more](/about/)', 'Body text.', '![second](b.jpg)'].join('\n'));
  assert.deepEqual(x.image, { alt: 'alt', src: 'a.jpg' });
  assert.equal(x.subtitle, 'Subtitle');
  assert.deepEqual(x.link, { label: 'Read more', url: '/about/' });
  assert.equal(x.text, 'Body text.\n![second](b.jpg)');
});

test('extract leaves code fences alone', () => {
  const x = extract(['```', '![alt](a.jpg)', '_not a subtitle_', '```'].join('\n'));
  assert.equal(x.image, null);
  assert.equal(x.subtitle, null);
  assert.match(x.text, /!\[alt\]\(a\.jpg\)/);
});
