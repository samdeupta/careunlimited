// Shared by the components: the optional heading + intro text above a component's main content.
import { esc } from '../util.mjs';
import { md } from '../markdown.mjs';

/** Optional heading + intro text above a component's main content. */
export function top(d, ctx, introMd = '') {
  const h = d.title && !ctx.page ? `<h2>${esc(d.title)}</h2>` : '';
  const i = introMd ? md(introMd).trim() : '';
  return h || i ? `<div class="${ctx.page ? 'lead' : 'center narrow'}">${h}${i}</div>` : '';
}
