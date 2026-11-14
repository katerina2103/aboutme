# Katya's portfolio — v2

Live website: https://katerina2103.github.io/aboutme/

An Eleventy site with editable YAML/Markdown content, story dialogs, eight Decision Lab slides and shared working principles.

## Editing

Start with [the content guide](content/README.md). All section copy is in `content/`; layouts and SVG geometry are in `src/_includes/`. Case studies and the 14 principles have separate folders, connected by stable IDs. Retired sections and unpublished case files have been removed.

## Development

- `pnpm install --frozen-lockfile`
- `pnpm start` for the static development preview
- `pnpm run build` to build and validate content, references and interactions

Node 22 or newer is required. Build output goes to `dist/` and is ignored by Git. The existing workflow deploys successful `main` builds to GitHub Pages.

## Feedback

The footer offers thumbs-up and thumbs-down votes. Each visitor's browser remembers their choice. There is no comment form, email delivery, attachment handling, backend, or shared counter. The separate contact button opens an email to Katya.

### Decision Lab layout checks

Run `npm run build` for every Decision Lab change. The build checks the shared panel inset and guards against narrow widths and forced breaks on slide titles and narrative paragraphs. In the rendered preview, review every slide at desktop and narrow mobile widths. Confirm the narrative follows the same text rails as the section intro, wraps naturally, and stays clear of the controls. Tables, charts and card grids can use their own internal layout.
