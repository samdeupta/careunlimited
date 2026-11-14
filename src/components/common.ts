// Shared by the components: the optional heading + intro text above a component's main content.
import { esc } from '../util';
import { md } from '../markdown';
import type { ComponentContext, ComponentData } from '../types';

/** Optional heading + intro text above a component's main content. */
export function top(d: ComponentData, ctx: ComponentContext, introMd = ''): string {
  const h = d.title && !ctx.page ? `<h2>${esc(d.title)}</h2>` : '';
  const i = introMd ? md(introMd).trim() : '';
  return h || i ? `<div class="${ctx.page ? 'lead' : 'center narrow'}">${h}${i}</div>` : '';
}
