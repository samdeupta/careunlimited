export type NavItem = {
  url: string;
  label: string;
};

export type SiteData = {
  name?: string;
  tagline?: string;
  description?: string;
  url?: string;
  favicon?: string;
  logo?: string;
  nav?: NavItem[];
  social?: NavItem[];
  address?: string[];
  phone?: string;
  email?: string;
  footer_blurb?: string;
};

export type JsonLdValue = Record<string, unknown>;

export type ComponentContext = {
  page: boolean;
  features: Set<string>;
  jsonld: JsonLdValue[];
};

export type ComponentData = {
  title?: string;
  type?: string;
  image?: string;
  image_alt?: string;
  image_position?: 'left' | 'right';
  cta?: { url: string; label: string };
  source?: string;
  email?: string;
  button_fallback?: string;
  schema?: string;
  banner?: string;
  hero_title?: string;
  hero_image?: string;
  hero_video?: string;
  hero_text?: string;
  hero_buttons?: NavItem[];
  cta_label?: string;
  show_title?: boolean;
  slug?: string;
  columns?: number | string;
  sections?: string[];
  sections_dir?: string;
  channel?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

const readStringArray = (value: unknown): string[] | undefined =>
  Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : undefined;

const readNavItems = (value: unknown): NavItem[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const items: NavItem[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return undefined;
    const url = readString(entry.url);
    const label = readString(entry.label);
    if (!url || !label) return undefined;
    items.push({ url, label });
  }
  return items;
};

export const normalizeSiteData = (value: unknown): SiteData => {
  if (!isRecord(value)) return {};
  return {
    name: readString(value.name),
    tagline: readString(value.tagline),
    description: readString(value.description),
    url: readString(value.url),
    favicon: readString(value.favicon),
    logo: readString(value.logo),
    nav: readNavItems(value.nav),
    social: readNavItems(value.social),
    address: readStringArray(value.address),
    phone: readString(value.phone),
    email: readString(value.email),
    footer_blurb: readString(value.footer_blurb),
  };
};

export const normalizeComponentData = (value: unknown): ComponentData => {
  if (!isRecord(value)) return {};
  const heroButtons = readNavItems(value.hero_buttons);
  const ctaUrl = isRecord(value.cta) ? readString(value.cta.url) : undefined;
  const ctaLabel = isRecord(value.cta) ? readString(value.cta.label) : undefined;
  const cta = ctaUrl && ctaLabel ? { url: ctaUrl, label: ctaLabel } : undefined;
  return {
    title: readString(value.title),
    type: readString(value.type),
    image: readString(value.image),
    image_alt: readString(value.image_alt),
    image_position: value.image_position === 'left' || value.image_position === 'right' ? value.image_position : undefined,
    cta,
    source: readString(value.source),
    email: readString(value.email),
    button_fallback: readString(value.button_fallback),
    schema: readString(value.schema),
    banner: readString(value.banner),
    hero_title: readString(value.hero_title),
    hero_image: readString(value.hero_image),
    hero_video: readString(value.hero_video),
    hero_text: readString(value.hero_text),
    hero_buttons: heroButtons,
    cta_label: readString(value.cta_label),
    show_title: typeof value.show_title === 'boolean' ? value.show_title : undefined,
    slug: readString(value.slug),
    columns: typeof value.columns === 'number' || typeof value.columns === 'string' ? value.columns : undefined,
    sections: readStringArray(value.sections),
    sections_dir: readString(value.sections_dir),
    channel: readString(value.channel),
  };
};

export type PageRecord = {
  file: string;
  data: ComponentData;
  content: string;
};

export type RenderedPage = {
  html: string;
  jsonld: JsonLdValue[];
  features: Set<string>;
};

export type MarkdownBlock = {
  title: string;
  body: string;
};

export type MarkdownSplitResult = {
  intro: string;
  blocks: MarkdownBlock[];
};

export type ExtractedMarkdown = {
  image: { alt: string; src: string } | null;
  link: { label: string; url: string } | null;
  subtitle: string | null;
  text: string;
};

export type ComponentDefinition = (
  d: ComponentData,
  content: string,
  ctx: ComponentContext,
  options?: { list?: boolean },
) => string;

export type ComponentRegistry = Record<string, ComponentDefinition>;
