# Katya's professional website

Eleventy + Nunjucks builds this site into plain static HTML, CSS and JavaScript in `dist/`. No server framework runs on the published site.

## Edit content without prompts

Open the `content` folder on GitHub, select a file, click the pencil, edit, and commit to `main`. GitHub Actions builds and publishes automatically.

| File | What to edit |
| --- | --- |
| `content/home.md` | Homepage introduction |
| `content/about.md` | About biography |
| `content/approach.md` | How I work paragraphs |
| `content/labels.yaml` | Headings, short labels, buttons and links; navigation also supplies section labels |
| `content/site.yaml` | Site title, description, email, CV/video/portrait paths |
| `content/cases/*.md` | Case-study titles, introductions and body text |
| `content/product-story/*.md` | Vision, strategy, roadmap and prototype writing |
| `content/audiences.yaml` | Hiring and collaboration tabs |
| `content/testimonials.yaml` | Approved testimonials |
| `content/principles.yaml` | The 14 principles |

See `content/README.md` for formatting details. Keep the paragraph markers in section Markdown files. Existing `<br>` in short headings controls line breaks; `*italics*` also works.

## Media and downloads

Upload files into `src/assets/`. Add the corresponding path in `content/site.yaml`, for example `cv: ./assets/katya-cv.pdf`, `video: ./assets/introduction.mp4`, or `portrait: ./assets/katya.jpg`. Leave the setting empty to keep the placeholder. Large videos may be better hosted externally; a video URL must point to a playable media file, not a video platform's normal page.

## Local development

Use Node 22+ and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

Templates live in `templates/`; styling and browser interactions are in `src/`. Content edits normally require neither. Do not edit `dist/`: it is generated.

## Publishing

The repository uses GitHub Pages with Source set to GitHub Actions. Main-branch pushes publish; pull requests build and check without deploying. The workflow installs pinned dependencies from `pnpm-lock.yaml`, builds the static site, and deploys only `dist/`.

The published site is public. The video, CV, product-work and testimonials placeholders remain until content is supplied. The local video picker previews a file on the visitor's device; it does not upload it.
