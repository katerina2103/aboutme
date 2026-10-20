# Editing content

- `site.yaml`: site title, description, CV/video/portrait paths. Upload files under `src/assets/` and use `./assets/filename`.
- `labels.yaml`: short text, headings, buttons and links, grouped by section. Navigation labels also supply section labels. Existing `<br>` entries are optional line breaks; use `*italics*` or `**bold**`.
- `home.md`, `about.md`, `approach.md` and the other section files: longer text. Keep the `<!-- paragraph1 -->` markers so each passage stays in the right place; blank lines create paragraphs.
- `cases/*.md`: case-study writing, with title and summary above the `---` divider. Keep each `order` unique.
- `product-story/*.md`: vision, strategy, roadmap and prototype text.
- `testimonials.yaml`: approved quotes, names and context.
- `principles.yaml`: the 14 principles.
- `audiences.yaml`: hiring/collaboration tab content.

Edit a file on GitHub and commit to main to publish. Do not edit generated dist files. Keep YAML indentation; use GitHub Preview for Markdown.
