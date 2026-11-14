// What the settings between the --- lines of a content file may contain.
//
// One table per kind of file (pages and blocks, and site.md). Each table is typed `Record<keyof …, Field>`, so adding
// a setting to the type in types.ts without adding it here is a compile error, and the build checks every content
// file against it: a misspelled setting name or a value of the wrong kind is reported (and fails --strict builds)
// instead of being silently ignored.
import type { ComponentData, NavItem, SiteData } from './types';
import { warn } from './warnings';

type Field = { ok: (value: unknown) => boolean; expected: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text: Field = { ok: (v) => typeof v === 'string', expected: 'text' };
const flag: Field = { ok: (v) => typeof v === 'boolean', expected: 'true or false' };
const textOrNumber: Field = {
  ok: (v) => typeof v === 'number' || typeof v === 'string',
  expected: 'a number',
};
const textList: Field = {
  ok: (v) => Array.isArray(v) && v.every((item) => typeof item === 'string'),
  expected: 'a list of text lines',
};
const isNavItem = (v: unknown): v is NavItem =>
  isRecord(v) && typeof v.url === 'string' && !!v.url && typeof v.label === 'string' && !!v.label;
const navItems: Field = {
  ok: (v) => Array.isArray(v) && v.every(isNavItem),
  expected: 'a list where every item has a url and a label',
};
const linkButton: Field = { ok: isNavItem, expected: 'a url and a label' };
const leftOrRight: Field = { ok: (v) => v === 'left' || v === 'right', expected: '"left" or "right"' };

export const COMPONENT_FIELDS: Record<keyof ComponentData, Field> = {
  title: text,
  description: text,
  type: text,
  image: text,
  image_alt: text,
  image_position: leftOrRight,
  cta: linkButton,
  source: text,
  email: text,
  button_fallback: text,
  schema: text,
  banner: text,
  hero_title: text,
  hero_image: text,
  hero_video: text,
  hero_text: text,
  hero_buttons: navItems,
  cta_label: text,
  show_title: flag,
  slug: text,
  columns: textOrNumber,
  sections: textList,
  sections_dir: text,
  channel: text,
};

export const SITE_FIELDS: Record<keyof SiteData, Field> = {
  name: text,
  tagline: text,
  description: text,
  url: text,
  favicon: text,
  logo: text,
  nav: navItems,
  social: navItems,
  address: textList,
  phone: text,
  email: text,
  footer_blurb: text,
};

/** Settings that used to exist: using one is an error with its own message, not a "misspelled" guess. */
const REMOVED: Record<string, string> = {
  layout: 'is no longer used. Use "type:" instead',
};

/** The closest known name, for "did you mean …?" (only when it is a near miss). */
function closest(name: string, known: string[]): string | undefined {
  const distance = (a: string, b: string): number => {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = above;
      }
    }
    return row[b.length];
  };
  const ranked = known.map((k) => ({ k, d: distance(name.toLowerCase(), k) })).sort((x, y) => x.d - y.d)[0];
  return ranked && ranked.d <= Math.max(2, Math.floor(name.length / 4)) ? ranked.k : undefined;
}

/** Keep the settings that are known and have the right kind of value; report the rest. */
function pick<T>(file: string, data: unknown, fields: Record<keyof T, Field>): T {
  const out: Record<string, unknown> = {};
  if (!isRecord(data)) return out as T;
  const table = fields as Record<string, Field | undefined>;
  const known = Object.keys(table);
  for (const [key, value] of Object.entries(data)) {
    if (key in REMOVED) throw new Error(`content/${file}: "${key}" ${REMOVED[key]}.`);
    const field = Object.hasOwn(table, key) ? table[key] : undefined;
    if (!field) {
      const guess = closest(key, known);
      warn(`content/${file}: unknown setting "${key}"${guess ? ` (did you mean "${guess}"?)` : ''}. It is ignored.`);
    } else if (value === null || value === undefined) {
      continue; // "key:" with nothing after it means "not set"
    } else if (!field.ok(value)) {
      warn(`content/${file}: "${key}" must be ${field.expected}. It is ignored.`);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

export const normalizeComponentData = (file: string, data: unknown): ComponentData =>
  pick<ComponentData>(file, data, COMPONENT_FIELDS);

export const normalizeSiteData = (file: string, data: unknown): SiteData => pick<SiteData>(file, data, SITE_FIELDS);
