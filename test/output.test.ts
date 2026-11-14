// Making root-relative URLs relative to the page that contains them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relativize } from '../src/output';

test('the home page uses ./', () => {
  assert.equal(relativize('<a href="/about/">x</a><img src="/imgs/a.jpg">', ''), '<a href="./about/">x</a><img src="./imgs/a.jpg">');
});

test('a nested page climbs one ../ per folder', () => {
  assert.equal(relativize('<a href="/">x</a>', 'a/b'), '<a href="../../">x</a>');
});

test('poster, data-src and CSS url() are rewritten too', () => {
  const out = relativize(
    `<video poster="/imgs/p.jpg"></video><a data-src="/vid/v.mp4"></a><i style="--a:url('/imgs/a.jpg')"></i><i style='--b:url("/imgs/b.jpg")'></i><i style="--c:url(/imgs/c.jpg)"></i>`,
    'x',
  );
  assert.equal(
    out,
    `<video poster="../imgs/p.jpg"></video><a data-src="../vid/v.mp4"></a><i style="--a:url('../imgs/a.jpg')"></i><i style='--b:url("../imgs/b.jpg")'></i><i style="--c:url(../imgs/c.jpg)"></i>`,
  );
});

test('external and protocol-relative addresses are left alone', () => {
  const html = '<a href="https://example.org/x"></a><script src="//cdn.example.org/a.js"></script><img src="data:image/png;base64,AAAA"><a href="#top"></a>';
  assert.equal(relativize(html, 'x'), html);
});
