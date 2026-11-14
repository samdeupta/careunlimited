# Developer guide

This project is a tiny static site generator for the Care Unlimited website. The source of truth is Markdown content under `content/`, and the build writes the final HTML into `dist/`.

## Commands

- `npm run build` builds the site
- `npm run preview` builds and serves the generated site locally
- `npm run check` runs type-checking, a strict build, and the unit tests
- `npm test` runs the test suite

The strict build is used in CI and in the PR check. It fails on missing images and videos, and on content warnings such as misspelled settings or bad field types.

## High-level architecture

- `build.ts` is the entry point. It scans `content/`, loads each page, normalizes the front matter, renders the page, writes the output files, and reports any problems after the build.
- `src/config.ts` defines the root paths (`ROOT`, `CONTENT`, `ASSETS`, `OUT`), the `STRICT` flag, CI detection, and the fallback brand colour for the favicon and browser theme.
- `src/content.ts` loads Markdown files and the site-wide settings from `content/site.md`.
- `src/schema.ts` defines which content settings a page or block may contain, and the type of value each setting accepts. It also normalizes defaults and reports invalid content.
- `src/markdown.ts` handles placeholder replacement (`{{ site.name }}`), strips hidden notes, converts Markdown to HTML, and splits text into sections or blocks by heading level.
- `src/images.ts` turns a content image reference into HTML or a URL and records missing files without breaking the build.
- `src/video.ts` detects YouTube, Vimeo, and local video URLs and builds the shared video player markup.
- `src/missing.ts` tracks files referenced in content but not found.
- `src/warnings.ts` tracks non-fatal content problems such as bad settings, wrong field types, and missing brand CSS.
- `src/report.ts` prints warnings and, in strict mode, fails the build when issues are present.
- `src/features.ts` adds lightweight viewer support for galleries and video thumbnails. It appends a native `<dialog>` viewer only when a page needs it.
- `src/page.ts` assembles a page from its settings, page content, and any section blocks. It also adds page-level hero output and viewer support if needed.
- `src/shell.ts` renders the base HTML document for a page, including `<head>`, header/menu, footer, and shared site-wide scripts.
- `src/output.ts` clears `dist/`, copies assets into it, writes each page, creates 404/sitemap/robots files, and validates internal links after the build.
- `src/components/` contains one file per block type (`text`, `cards`, `accordion`, `gallery`, `videos`, `testimonials`, `page-index`, `form`, etc.), and `registry.ts` maps block names to their renderers.
- `src/types.ts` declares the data shapes used for pages, components, and rendered output.
- `src/util.ts` contains the small string helpers used throughout the build: escaping, slugifying, and unescaping.
- `src/template.ts` renders small reusable HTML templates and throws when a placeholder is missing.

## Content model

Each content file is front matter plus Markdown body:

```md
---
title: About Us
banner: about/about-banner.png
---
Care Unlimited commenced in 2015.
```

- The front matter is a YAML-like settings block between two `---` lines.
- The page body below it is standard Markdown.
- Every page is generated from a file in `content/` except `content/site.md`, which is the site-wide settings file.
- Pages can include extra section files in a matching sub-directory, such as `content/home/` or `content/services/`.

## Content conventions

- `site.md` defines shared values such as the site name, navigation, footer details, address, email, and logo.
- Pages and blocks can use placeholders such as `{{ site.phone }}` or `{{ site.address }}` anywhere in Markdown text.
- Images are stored under `assets/imgs/` and referenced relative to that folder.
- Videos can be pasted as a direct URL or stored in `assets/vid/` and referenced by path.
- The build tolerates missing images and videos by skipping them and reporting a warning; in strict mode, they fail the build.
- Internal links are checked after the build, so broken routes and invalid page links are caught before deployment.

## Block types

The site can render a wide range of content blocks. The registry wires them up by `type:` value, and each component is responsible for converting a Markdown chunk plus settings into HTML.

Common block types include:

- `text` and `list`
- `cards`
- `accordion`
- `gallery`
- `videos`
- `testimonials`
- `index`
- `form`

Each component may also add viewer features or JSON-LD structured data to the page context.

## Validation and reporting

The build intentionally fails early for real configuration problems:

- missing content files referenced by page data
- unknown component types
- bad settings names or wrong value types
- missing required image or video files in strict mode
- broken internal links in the generated site

This is handled by the `missing` and `warning` trackers, then surfaced in the final report.

## Notes for maintainers

- Each file in `src/` has a narrow responsibility; the project is intentionally modular.
- Comment-heavy rationale lives here rather than in the code itself so the implementation stays readable.
- If you add a new content block type, add one renderer file and register it in `src/components/registry.ts`.
- If you add a new setting to a content file, update the schema in `src/schema.ts` and the relevant type definitions in `src/types.ts`.
