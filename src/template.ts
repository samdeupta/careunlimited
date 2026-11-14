import fs from 'node:fs';

const templates = new Map<string, string>();

export function renderTemplate(
  name: string,
  values: Record<string, string | number | boolean | undefined> = {},
): string {
  let template = templates.get(name);
  if (template === undefined) {
    template = fs.readFileSync(new URL(`./templates/${name}.html`, import.meta.url), 'utf8');
    templates.set(name, template);
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!Object.hasOwn(values, key))
      throw new Error(`Missing value for template placeholder "${key}" in ${name}.html`);
    const value = values[key];
    if (value === undefined) throw new Error(`Missing value for template placeholder "${key}" in ${name}.html`);
    return String(value);
  });
}
