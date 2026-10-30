# Katya's portfolio — v2

Live website: https://katerina2103.github.io/aboutme/

An Eleventy site with editable YAML/Markdown content, story dialogs, seven Decision Lab slides and shared working principles.

## Editing

Start with [the content guide](content/README.md). All section copy is in `content/`; layouts and SVG geometry are in `src/_includes/`. Case studies and the 14 principles have separate folders, connected by stable IDs. Retired sections and unpublished case files have been removed.

## Development

- `pnpm install --frozen-lockfile`
- `pnpm start` for the static development preview
- `pnpm run build` to build and validate content, references and interactions

Node 22 or newer is required. Build output goes to `dist/` and is ignored by Git. The existing workflow deploys successful `main` builds to GitHub Pages.

## Feedback

The public site offers email feedback. The optional local feedback server (`python3 scripts/feedback-preview.py`) serves the built site on port 4173 and stores votes/comments in a private checkout-local SQLite file. `python3 scripts/feedback-report.py` creates a local report. Neither local data nor local-only scripts are deployment dependencies. GitHub Pages cannot run that server; a hosted backend is still needed for live voting.
