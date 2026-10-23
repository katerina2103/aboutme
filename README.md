# Bright blocks: Katya's portfolio site

A single-page static site built with [Eleventy](https://www.11ty.dev/).
All text lives in `content/`, one file per page section. The HTML lives in small templates, one per page section.
The build outputs one self-contained `dist/index.html` with CSS inlined and a ~20-line scroll-reveal script. URL https://katerina2103.github.io/aboutme/

## Quick start

```bash
npm install        # or pnpm install
npm start          # dev server with live reload at http://localhost:8080
npm run build      # writes dist/index.html, then runs the check
```

Upload `dist/index.html` to any static host (Netlify, GitHub Pages, S3, …).

## Changing content

Everything you'd edit lives in **`content/`**, one file per page section, numbered in page order:

```
content/
  00-settings.yaml        tab title, search description, accent colour, animations on/off
  01-navigation.yaml      name top-left + menu links
  02-hero.md              headline, buttons, dilemma card; text below --- is the intro
  03-stats-band.yaml      big numbers on the accent band
  04-experience.yaml      "Decisions behind the outcomes" + case studies
  05-video-and-meet.yaml  video card + "Meet Katya"
  06-approach.yaml        "How I work" + principles
  07-about.md             title + quote; text below --- is the right-hand column
  08-contact.md           title + button; text below --- is the paragraph
  09-footer.yaml          footer lines
```

`.yaml` is used for sections that are mostly fields and lists. `.md` is used where there's
running text: the block between the `---` lines holds the fields, and everything below it
is the body. `content/README.md` is a short editing guide for whoever maintains the text.

**Formatting** (Markdown, converted to HTML at build time):

- `*words*` turns into the italic serif highlight used in headings
- `**words**` turns into bold
- `[label](https://…)` turns into a link
- The body of a `.md` file also takes blank-line paragraphs and `- bullet` lists.
- Raw HTML is escaped on purpose, so a stray `<` can't break the layout.

**Lists** (case studies, principles, stats, nav links, card options) can be extended,
shortened or reordered. The numbers `01, 02…` and `1, 2, 3…` follow the list order.

**How files become data:** `scripts/load-content.mjs` turns each file into a key on the
`site` object that the templates use. The number prefix is dropped and dashes become
underscores (`03-stats-band.yaml` becomes `site.stats_band`). A `.md` file's text lands in `body`.
Files starting with `_`, and `README.md`, are ignored.

## Changing layout or styling

```
src/
  index.njk                     page structure: order of the sections
  _includes/
    base.njk                    <html>/<head>, fonts, nav + footer
    styles.css                  all styling; colours are CSS variables at the top
    motion.css, reveal.js       animations
    sections/*.njk              one template per section, named after its content file
eleventy.config.js              loads content/ as `site` + the `md` / `mdInline` filters
scripts/load-content.mjs        reads content/ (shared by the build and the check)
scripts/check.mjs               post-build validation
```

To reorder or drop a section, edit the `{% include %}` lines in `src/index.njk`.

## Animations

- **Scroll reveal.** Elements marked `data-reveal` in the templates fade and slide in
  when they scroll into view. `style="--i: 2"` sets the stagger order (each step ≈ 90 ms
  later), and `data-reveal="right"` slides in from the side. Sticky notes "slap" on once
  their block has appeared. Turn it off with `scroll_animations: false` in `content/00-settings.yaml`.
- **Micro-interactions** (always on): button lift, nav underline, case rows nudging
  right with the sticky note straightening, principle cards lifting with the badge popping,
  a pulse on the video play button.
- All motion lives in `src/_includes/motion.css`, and `src/_includes/reveal.js` is ~20 lines
  using IntersectionObserver.
- Visitors with "reduce motion" switched on, or without JavaScript, get the static page
  with nothing hidden.

## Principles overlay

"Explore my … principles" opens an overlay with every principle in `content/06-approach.yaml`.
Principles marked `show_on_page: true` also appear as cards in the section. `{count}` in
the link and overlay title is filled in automatically. The overlay uses the native `<dialog>`
element (`src/_includes/sections/principles-overlay.njk`, `overlay.css`, `dialogs.js`):

- Esc, the × button, or a click on the dimmed background closes it.
- `/#principles` is a shareable link that opens it directly.
- Without JavaScript, the link jumps to the list shown inline.

To add another overlay, give a `<dialog class="overlay" id="…">` an id and point a link at it
with `data-open-dialog="…"`. No extra script is needed.

## The check

`npm run build` runs `scripts/check.mjs` after Eleventy. The build fails with a message naming
the file and field if any of these is wrong:

- a content file can't be parsed (it names the file and the YAML error)
- a section file is missing, a required field is empty, or a list item lacks its `title`/`label`/etc.
- the accent colour isn't a hex value
- the output contains `undefined`, `[object Object]` or leftover `{{ … }}` (usually a misspelt key)
- an in-page link like `#work` points to a section that doesn't exist
- an email link is malformed
- the page doesn't have exactly one `<h1>`

It also *warns*, without failing, while placeholder principles (`placeholder: true`) remain.

Run `npm run check` on its own to re-check an existing build.
