# Agent instructions

This repository is the Care Unlimited website: a small static site generator that turns Markdown in `content/` (plus pictures and videos in `assets/`) into HTML.

## Start here

Before doing anything else, read both files completely:

1. [`README.md`](README.md): the content guide (settings, Markdown, block types, pictures, videos, pages).
2. [`DEVELOPERS.md`](DEVELOPERS.md): how the build works, what it supports, and how it is checked and deployed.

Do this in every mode, even for a one-line edit. They define what the site can and cannot do, and they are the source of truth for settings, block types and file locations.

## Modes

There are two modes. **The default is `editor`.** Stay in `editor` mode unless the user explicitly asks for `dev` mode (for example "dev mode", "switch to dev", "I'm working on the repo code"). The mode lasts for the whole conversation until the user changes it. If you are unsure which mode applies, use `editor`.

### `editor` mode (default)

For people who want to update the website's content with an agent's help.

**Allowed:** create, edit, rename and delete files **only** inside `content/` and `assets/`.

**Not allowed:** changing anything else, including `src/`, `build.ts`, `test/`, `.github/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vercel.json`, `README.md`, `DEVELOPERS.md`, `AGENTS.md` and `CLAUDE.md`. Do not change `assets/style.css` or `assets/fonts/` either, unless the user explicitly asks for a styling change (and if so, keep the `--blue-dark-rgb` definition in `style.css`, which the build needs).

Rules:

- Follow `README.md` for everything: settings syntax, quoting, Markdown, file naming, where pictures and videos go, how `sections:` and `nav` work.
- Leave technical settings alone (for example `url` in `content/site.md`) unless the user explicitly asks.
- When you add or rename a page, update `nav` in `content/site.md` if the user wants it in the menu, and keep `slug` and menu URLs consistent.
- When you add a picture or video reference, make sure the file exists in `assets/`. Never invent file names. If the user hasn't supplied the file, say so and leave a clear note rather than referencing a missing file.
- Checking your work is fine and encouraged: `npm ci` (if `node_modules` is missing), `npm run build` and `npm run check`. These only write to git-ignored folders (`node_modules/`, `dist/`). Fix any problems they report that originate in `content/` or `assets/`.
- Don't commit, push or trigger the deploy workflow unless the user asks.

**If the request needs something the current build can't do**, do not try to make it work by editing build files, and do not fake it with workarounds (raw HTML or scripts pasted into Markdown, hand-edited files in `dist/`, and the like). Instead:

1. Say plainly that it isn't possible with the current setup, and name what is missing (for example "there is no block type for this" or "there is no setting for that").
2. Offer the closest thing the existing block types and settings can do, if there is one.
3. Tell the user that adding the capability is developer work, and that they can ask for it in `dev` mode or pass the request to the person who looks after the repo.

Examples of things that need `dev` mode: a new kind of block or layout, a new setting, a real form that sends messages, a live feed from another site, custom styling or scripts for one page, changes to the menu or footer structure, redirects, and changes to how the site is built or deployed.

### `dev` mode

For work on the repository itself. Changes anywhere in the repo are allowed as needed (`src/`, `build.ts`, `test/`, `.github/`, `vercel.json`, docs, content and assets).

Rules:

- Keep the project's design: each file in `src/` has one narrow job, block renderers live in `src/components/` and are registered in `src/components/registry.ts`, and settings must be declared in `src/schema.ts` and `src/types.ts`. `DEVELOPERS.md` has the step-by-step for adding a block type or setting.
- **Keep the docs in sync.** If a change affects what editors can do (new block type, new or removed setting, changed behaviour), update `README.md`. If it affects how the code, tests, CI or deployment work, update `DEVELOPERS.md`. Remove references to anything you remove, from `src/`, `content/` and the docs.
- Add or update tests in `test/` for logic worth protecting.
- Run `npm run check` (type-check, strict build, tests) before calling the work done, and report anything you couldn't run.
- Treat the GitHub workflows as security-sensitive: keep actions pinned to commit SHAs, the Vercel CLI pinned to an exact version, permissions minimal, and secrets scoped to the steps that need them. Never put secrets or tokens in the repo.
- Match the existing commit style (`feat:`, `fix:`, `chore:`, `ci:`, `test:`, `content:` prefixes) if asked to write commit messages. Don't commit, push or trigger the deploy workflow unless the user asks.
- `README.md` is written for non-technical editors, so keep technical detail out of it and put it in `DEVELOPERS.md`.
