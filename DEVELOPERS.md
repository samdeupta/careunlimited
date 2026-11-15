# Developer guide

This project is a small static site generator for the Care Unlimited website. Markdown files under `content/` are the source of truth; the build writes finished HTML into `dist/`, which is what gets deployed.

This guide is for people changing the **code**. If you only want to change words, pictures or videos, read the content guide in [README.md](README.md) instead.

## Quick start

Requires Node 18 or newer (CI uses Node 22).

```sh
npm ci
npm run preview   # build, then serve dist/ locally
```

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Builds the site into `dist/`. Problems are reported as warnings and the build still succeeds. |
| `npm run preview` | Builds, then serves `dist/` locally with `serve`. |
| `npm run check` | Type-checks (`tsc --noEmit`), runs a **strict** build, then runs the tests. This is what CI runs. |
| `npm test` | Runs the tests in `test/` with the Node test runner. |

**Strict mode** (`--strict`) turns every build problem into a failure: missing images, missing videos, missing hero videos, and content warnings such as misspelled settings or wrong value types. Use plain `npm run build` while writing content, and `npm run check` before pushing.

## How a build works

`build.ts` is the entry point. It runs the whole pipeline in one pass:

1. **Clean.** Delete `dist/` and copy `assets/` into it (`cleanOutput`).
2. **Load.** Read every `content/*.md` file except `site.md`. Each is split into settings (front matter) and a Markdown body, and the settings are checked against the schema.
3. **Render.** For each page, build the hero or title, then render the page's own body and each of its section files into `<section>` bands using the matching block component.
4. **Wrap.** Put the page into the HTML shell (head, menu, footer, shared scripts, structured data).
5. **Write.** Save each page as `dist/<slug>/index.html`, rewriting root-relative URLs to relative ones so the site works from any path.
6. **Extras.** Write `404.html`, and `sitemap.xml` and `robots.txt` if `site.url` is set in `content/site.md`.
7. **Validate.** Check every internal link and asset reference in the generated pages; a broken one stops the build.
8. **Report.** Print warnings and missing files; in strict mode, exit with an error if there are any.

## Source layout

### Build pipeline

- `build.ts`: the entry point described above.
- `src/config.ts`: root paths (`ROOT`, `CONTENT`, `ASSETS`, `OUT`), the `STRICT` flag, CI detection (GitHub Actions error annotations), and the brand colour read from `assets/style.css` (`--blue-dark-rgb`) for the favicon and theme colour, with a fallback.
- `src/content.ts`: loads Markdown files with `gray-matter` and the site-wide settings from `content/site.md`. YAML errors are rethrown with the file name and line.
- `src/schema.ts`: defines which settings a page, block or `site.md` may contain and the type of each (`COMPONENT_FIELDS`, `SITE_FIELDS`). It normalizes values, drops bad ones, suggests corrections for misspellings, and rejects retired settings such as `layout`.
- `src/page.ts`: assembles one page. It renders the page's own body (if any), then each file named in the `sections:` setting (looked up in `sections_dir`, or a folder named after the page), then builds the banner, hero or title heading.
- `src/shell.ts` and `src/templates/shell.html`: the base HTML document.
- `src/output.ts`: cleaning `dist/`, writing pages, 404/sitemap/robots, URL relativizing and internal-link validation (a broken link throws, in any mode).

### Content processing

- `src/markdown.ts`: replaces `{{ site.x }}` placeholders (unknown ones throw), strips HTML comments, converts Markdown to HTML with `marked`, and splits text into sections by heading level. It ignores headings inside code fences.
- `src/images.ts`: turns an image reference into an `<img>` or URL and records missing files instead of breaking the build.
- `src/video.ts`: recognises YouTube, Vimeo and local video URLs and builds the shared player markup. Local files are looked up in `assets/vid/`.
- `src/features.ts` and `src/templates/lightbox.html`: the native `<dialog>` viewer for galleries and video thumbnails. It is added to a page only when that page needs it.
- `src/template.ts`: renders the small HTML templates in `src/templates/`; throws if a placeholder is missing.
- `src/util.ts`: string helpers (escaping, slugifying, unescaping).
- `src/types.ts`: the data shapes for pages, components and rendered output.

### Block components

`src/components/` holds one file per block type. `registry.ts` maps the `type:` value in a content file to its renderer, and `common.ts` holds helpers shared between blocks (for example the optional title and intro above a block).

| `type:` | File | Notes |
|---|---|---|
| `text` (default) | `text.ts` | Plain Markdown content |
| `list` | `text.ts` | Same as `text`, styled as a checklist |
| `cards` | `cards.ts` | One card per `##` heading |
| `accordion` | `accordion.ts` | One collapsible item per `##` heading; can add FAQ structured data |
| `gallery` | `gallery.ts` | Pictures opening in the lightbox |
| `videos` | `videos.ts` | Video thumbnails opening in the lightbox |
| `testimonials` | `testimonials.ts` | Quotes with attribution |
| `index` | `page-index.ts` | Links to each `##` heading of another page, named by the required `source:` setting, plus a "Read more" button |
| `form` | `form.ts` | Despite the name, this is an "Email us" `mailto:` button (the email comes from the block's `email` setting or `site.email`). It does not render a form or post anywhere. |

A block with no `type:` is treated as `text`. An unknown type fails the build and lists the available ones. Blocks may also add viewer features or JSON-LD structured data to the page.

### Problem tracking

- `src/missing.ts`: records files referenced in content but not found (images, videos, hero videos).
- `src/warnings.ts`: records non-fatal content problems such as bad settings, wrong value types or a missing brand colour.
- `src/report.ts`: prints both after the build and, in strict mode, exits with an error. It also warns about video files over 50 MB, because GitHub warns at 50 MB and rejects files over 100 MB.

## Content model

Each content file is front matter plus a Markdown body:

```md
---
title: About Us
banner: about/about-banner.png
---
Care Unlimited commenced in 2015.
```

- Every `content/*.md` file becomes a page, except `content/site.md`, which holds site-wide settings (name, navigation, footer details, address, email, logo and so on).
- A page can be made of extra block files. List their names in the page's `sections:` setting; each name is read from `content/<page name>/<name>.md`, or from `sections_dir` if set. A missing section file fails the build.
- `slug` overrides the page's URL; the home page has an empty slug.
- `{{ site.phone }}`, `{{ site.address }}` and other `site.*` placeholders work anywhere in Markdown text.
- Images live in `assets/imgs/` and are referenced relative to that folder.
- Videos: a direct YouTube/Vimeo URL, or a local file in `assets/vid/` for content blocks. Hero background videos (`hero_video`) are different: they come from `assets/vids/`. Note that `assets/vid/` only exists once a content video is added.

## What fails the build

Some problems always fail the build, in any mode:

- a section file listed in `sections:` that doesn't exist
- an unknown block `type:`
- a retired setting such as `layout`
- invalid YAML in the settings block
- an unknown `{{ site.x }}` placeholder
- a broken internal link or asset reference in the generated pages (checked after the build)
- an `index` block with no `source:` setting

Others are reported as warnings and only fail in strict mode (CI and `npm run check`):

- misspelled setting names or wrong value types
- missing image, video or hero video files
- a missing `--blue-dark-rgb` in `assets/style.css`

## Tests

Tests live in `test/` and run with `npm test`:

- `build.test.ts`: the strict build succeeds, every page is sane HTML, and `404.html`, `sitemap.xml` and `robots.txt` exist.
- `markdown.test.ts`: images, videos, placeholders, comment stripping, heading splitting and code fences.
- `output.test.ts`: root-relative URLs are rewritten correctly at each page depth.
- `schema.test.ts`: setting validation, misspelling suggestions and wrong value types.

## CI and deployment

- **Build check** (`.github/workflows/build-check.yml`) runs `npm run check` on every push to any branch.
- **Deploy to Vercel** (`.github/workflows/vercel_deploy.yml`) is run manually (`workflow_dispatch`). A `check` job runs `npm run check`, and the `deploy` job only starts if it passes. The deploy job pulls the Vercel project settings, builds with `vercel build --prod`, and deploys the prebuilt output.
- The deploy needs three repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`. They are only exposed to the steps that use them.
- Actions are pinned to commit SHAs and the Vercel CLI to an exact version. Bump them deliberately, preferably to releases at least two weeks old.
- `vercel.json` sets the install command (`npm ci --ignore-scripts`), the build command (`npm run build`) and the output directory (`dist`), and turns off Vercel's own Git-triggered deployments, so nothing deploys except through the workflow.

## Extending the site

### Add a block type

1. Create `src/components/<name>.ts` exporting a function `(data, content, ctx) => string`.
2. Import it and add it to `COMPONENTS` in `src/components/registry.ts`.
3. If it takes new settings, add them to `COMPONENT_FIELDS` in `src/schema.ts` and to the data type in `src/types.ts`.
4. If it needs the lightbox or structured data, set it through `ctx` (see `gallery.ts` and `accordion.ts`).
5. Add a content file that uses it, and a test if it has logic worth protecting.
6. Run `npm run check`.

### Add a setting to an existing block or page

Add it to `COMPONENT_FIELDS` (or `SITE_FIELDS` for `site.md`) in `src/schema.ts` and to the matching type in `src/types.ts`. Unlisted settings are reported as misspellings, so this step is required.

### Remove a setting

Delete it from `schema.ts` and `types.ts`, and remove it from every file in `src/` and `content/`. To make a removed setting fail with an explanation instead of a "misspelled" warning, add it to the `REMOVED` list in `schema.ts`, as `layout` is.

## Notes for maintainers

- Each file in `src/` has one narrow job; keep it that way.
- Keep architecture notes in this guide rather than in code comments, so the code stays readable. Short comments explaining a non-obvious decision are fine.
- The output uses relative URLs (`./`, `../`), so `dist/` works when served from any folder, not only from the domain root.
