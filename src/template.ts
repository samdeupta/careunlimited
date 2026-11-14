import fs from 'node:fs';

const templates = new Map();

export function renderTemplate(name, values = {}) {
  let template = templates.get(name);
  if (template === undefined) {
    template = fs.readFileSync(new URL(`./templates/${name}.html`, import.meta.url), 'utf8');
    templates.set(name, template);
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key))
      throw new Error(`Missing value for template placeholder "${key}" in ${name}.html`);
    return values[key];
  });
}
