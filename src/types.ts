export type SiteValue = string | string[] | Array<{ url: string; label: string }> | undefined;

export type SiteData = Record<string, SiteValue> & {
  name?: string;
  tagline?: string;
  description?: string;
  url?: string;
  favicon?: string;
  logo?: string;
  nav?: Array<{ url: string; label: string }>;
  social?: Array<{ url: string; label: string }>;
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

export type ComponentData = Record<string, unknown> & {
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
  hero_buttons?: Array<{ url: string; label: string }>;
  cta_label?: string;
  show_title?: boolean;
  slug?: string;
  columns?: number | string;
  sections?: string[];
  sections_dir?: string;
  channel?: string;
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
