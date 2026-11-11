// type: form. An enquiry form built from `fields:`, with the page text shown beside it.
import { esc } from '../util.mjs';
import { site } from '../content.mjs';
import { md } from '../markdown.mjs';

/** An enquiry form built from `fields:`. Side text (the Markdown body) is shown beside it. */
export function form(d, content, ctx) {
  const action = d.action ?? site.form_action;
  const netlify = d.netlify ?? site.form_netlify;
  const formName = esc(d.form_name || 'form');
  const field = (f) => {
    const label = esc(f.label ?? f.name);
    const common = `name="${esc(f.name)}"${f.required ? ' required' : ''}${f.autocomplete ? ` autocomplete="${esc(f.autocomplete)}"` : ''}`;
    const input =
      f.type === 'textarea'
        ? `<textarea ${common} rows="5"></textarea>`
        : `<input type="${esc(f.type || 'text')}" ${common}>`;
    return `<label>${label}${input}</label>`;
  };
  const body = action
    ? `<form class="site-form" action="${esc(action)}" method="post"${netlify ? ` name="${formName}" data-netlify="true" netlify-honeypot="company"` : ''}>
        ${netlify ? `<input type="hidden" name="form-name" value="${formName}">` : ''}
        <p class="hp"><label>Leave this empty <input name="company" tabindex="-1" autocomplete="off"></label></p>
        ${(d.fields || []).map(field).join('\n')}
        <button class="btn" type="submit">${esc(d.button || 'Send message')}</button>
      </form>`
    : `<p><a class="btn" href="mailto:${esc(d.email ?? site.email)}">${esc(d.button_fallback || 'Email us')}</a></p>`;
  const side = content.trim() ? `<div>${md(content)}</div>` : '';
  const h = d.title && !ctx.page ? `<h2>${esc(d.title)}</h2>` : '';
  return `${h}<div class="${side ? 'split' : 'single'}">${side}<div>${body}</div></div>`;
}
