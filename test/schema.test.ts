import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeComponentData, normalizeSiteData } from '../src/schema';
import { warnings } from '../src/warnings';

beforeEach(() => {
  warnings.length = 0;
});

test('valid settings pass through untouched, with no warnings', () => {
  const data = { title: 'Hi', type: 'cards', columns: 3, image_position: 'left', show_title: false, cta: { url: '/x/', label: 'Go' } };
  assert.deepEqual(normalizeComponentData('a.md', data), data);
  assert.deepEqual(warnings, []);
});

test('a misspelled setting is reported, with a suggestion, and ignored', () => {
  const out = normalizeComponentData('home/about.md', { image_postion: 'left', title: 'T' });
  assert.deepEqual(out, { title: 'T' });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /content\/home\/about\.md: unknown setting "image_postion" \(did you mean "image_position"\?\)/);
});

test('a setting that is not close to any known one gets no suggestion', () => {
  normalizeComponentData('a.md', { zzzzzz: 1 });
  assert.match(warnings[0], /unknown setting "zzzzzz"\. It is ignored/);
});

test('a value of the wrong kind is reported and dropped', () => {
  const out = normalizeComponentData('a.md', { image_position: 'center', columns: [3], sections: 'one', hero_buttons: [{ label: 'x' }] });
  assert.deepEqual(out, {});
  assert.equal(warnings.length, 4);
  assert.ok(warnings.some((w) => w.includes('"image_position" must be "left" or "right"')));
});

test('an empty setting ("key:" with nothing after it) is just "not set"', () => {
  assert.deepEqual(normalizeComponentData('a.md', { banner: null, title: 'T' }), { title: 'T' });
  assert.deepEqual(warnings, []);
});

test('a phone number written without quotes (a YAML number) is caught', () => {
  normalizeSiteData('site.md', { phone: 9830012345 });
  assert.match(warnings[0], /"phone" must be text/);
});

test('the retired "layout" setting is a hard error', () => {
  assert.throws(() => normalizeComponentData('a.md', { layout: 'cards' }), /"layout" is no longer used\. Use "type:"/);
});

test('data that is not a settings block at all gives empty settings', () => {
  assert.deepEqual(normalizeComponentData('a.md', undefined), {});
  assert.deepEqual(normalizeComponentData('a.md', ['x']), {});
});
