// The list of block types. `type: cards` in a content file looks "cards" up here.
// To add a new type: write one component file and add one line below. Nothing else needs to change.
import { text, list } from './text';
import { cards } from './cards';
import { accordion } from './accordion';
import { gallery } from './gallery';
import { videos } from './videos';
import { testimonials } from './testimonials';
import { index } from './page-index';
import { form } from './form';
import type { ComponentRegistry } from '../types';

/* A component turns a chunk of Markdown (plus its settings) into HTML. A page, or a block inside a page, picks one
   with `type:` in its settings. Nothing here is specific to any page: every page can use every component.
   Components receive (settings, markdownBody, ctx) and return an HTML string. They may add to ctx.features
   (e.g. 'lightbox') or ctx.jsonld (structured data for search engines). ctx.page is true when the component is the
   page's own body, whose heading is already the page <h1>. */
export const COMPONENTS: ComponentRegistry = {
  text,
  list,
  cards,
  accordion,
  gallery,
  videos,
  testimonials,
  index,
  form,
};
