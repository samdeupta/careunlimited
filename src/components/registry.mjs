// The list of block types. `type: cards` in a content file looks "cards" up here.
// To add a new type: write one component file and add one line below. Nothing else needs to change.
import { text, list } from './text.mjs';
import { cards } from './cards.mjs';
import { accordion } from './accordion.mjs';
import { gallery } from './gallery.mjs';
import { videos } from './videos.mjs';
import { testimonials } from './testimonials.mjs';
import { index } from './page-index.mjs';
import { form } from './form.mjs';

/* A component turns a chunk of Markdown (plus its settings) into HTML. A page, or a block inside a page, picks one
   with `type:` in its settings. Nothing here is specific to any page: every page can use every component.
   Components receive (settings, markdownBody, ctx) and return an HTML string. They may add to ctx.features
   (e.g. 'lightbox') or ctx.jsonld (structured data for search engines). ctx.page is true when the component is the
   page's own body, whose heading is already the page <h1>. */
export const COMPONENTS = {
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
