// type: form. The contact block: the page text shown beside an "Email us" button (a mailto: link).
import { esc } from '../util';
import { site } from '../content';
import { md } from '../markdown';
import type { ComponentContext, ComponentData } from '../types';

/** The page text (the Markdown body) beside an "Email us" button. */
export function form(d: ComponentData, content: string, ctx: ComponentContext): string {
  const email = typeof d.email === 'string' && d.email ? d.email : site.email;
  const body = `<p><a class="btn" href="mailto:${esc(email)}">${esc(d.button_fallback || 'Email us')}</a></p>`;
  const side = content.trim() ? `<div>${md(content)}</div>` : '';
  const h = d.title && !ctx.page ? `<h2>${esc(d.title)}</h2>` : '';
  return `${h}<div class="${side ? 'split' : 'single'}">${side}<div>${body}</div></div>`;
}
