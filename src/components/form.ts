// type: form. The contact block: the page text shown beside an "Email us" button (a mailto: link).
import { esc } from '../util.mjs';
import { site } from '../content.mjs';
import { md } from '../markdown.mjs';

/** The page text (the Markdown body) beside an "Email us" button. */
export function form(d, content, ctx) {
  const body = `<p><a class="btn" href="mailto:${esc(d.email ?? site.email)}">${esc(d.button_fallback || 'Email us')}</a></p>`;
  const side = content.trim() ? `<div>${md(content)}</div>` : '';
  const h = d.title && !ctx.page ? `<h2>${esc(d.title)}</h2>` : '';
  return `${h}<div class="${side ? 'split' : 'single'}">${side}<div>${body}</div></div>`;
}
