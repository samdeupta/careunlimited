// Builds the whole site (strict) and checks the generated HTML for the mistakes a human reviewer would catch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { OUT, ROOT } from '../src/config';

const run = spawnSync(process.execPath, ['--import', 'tsx', 'build.ts', '--strict'], { cwd: ROOT, encoding: 'utf8' });

const pages: string[] = [];
(function walk(dir: string): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) walk(path.join(dir, entry.name));
    else if (entry.name === 'index.html') pages.push(path.join(dir, entry.name));
  }
})(OUT);

test('the strict build succeeds', () => {
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.ok(pages.length > 0, 'no pages were built');
});

for (const file of pages) {
  const name = path.relative(OUT, file) || 'index.html';
  test(`${name}: sane HTML`, () => {
    const html = fs.readFileSync(file, 'utf8');
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, 'expected exactly one <h1>');
    assert.match(html, /<title>[^<]+<\/title>/, 'missing or empty <title>');
    assert.doesNotMatch(html, /\{\{\s*[\w.]+\s*(?:\|[^}]*)?\}\}/, 'unfilled {{ placeholder }}');
    assert.doesNotMatch(html, /\[object Object\]|>undefined<|>NaN<|="undefined"/, 'a value did not render');
    assert.doesNotMatch(html, /\s(?:href|src|poster|data-src)="\/(?!\/)/, 'a root-absolute URL was not made relative');
    assert.doesNotMatch(html, /url\(\s*['"]?\/(?!\/)/, 'a root-absolute CSS url() was not made relative');
    assert.doesNotMatch(html, /<img[^>]*\ssrc=""/, 'an <img> with an empty src');
  });
}

test('404.html, sitemap.xml and robots.txt exist', () => {
  for (const f of ['404.html', 'sitemap.xml', 'robots.txt']) assert.ok(fs.existsSync(path.join(OUT, f)), f);
});
