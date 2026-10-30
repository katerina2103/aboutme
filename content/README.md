# Editing website v2

All published section text lives here. Change text in the relevant file, keeping field names intact. YAML values can span multiple indented lines. Markdown files use fields between the opening `---` lines and paragraphs below the closing `---`.

| Location | What it controls |
| --- | --- |
| `00-settings.yaml` | Browser title, search description, accent and section animation setting |
| `01-navigation.yaml` | Brand name and navigation links |
| `02-hero.md` | Opening headline, introduction, portrait path and the three social links |
| `04-experience.yaml` | Impact tiles, metrics, stickers and links to case detail files |
| `05-video.yaml` | Personal introduction, sticker, recording link and preparation message |
| `06-decision-lab.yaml` | Company context, CEO brief, carousel controls and answer feedback |
| `decision-lab/` | Seven slide files, in carousel order |
| `08-contact.md` | Contact invitation, email, location and testimonial |
| `09-feedback.yaml` | Feedback question, voting buttons and acknowledgement |
| `10-footer.yaml` | Footer text and version |
| `case-studies/` | Three published impact stories and their principle references |
| `principles/` | All 14 working principles, one per file |

## Editing the Decision Lab

Each slide has a matching YAML file under `decision-lab/`. Its `copy:` fields contain the text displayed on that slide, including table cells, graph labels and expandable details. Descriptive field names identify the current wording; change values, not field names. The matching layout is in `src/_includes/slides/`; you do not need to edit it for wording changes.

Chart labels, chart coordinates, financial calculations and model assumptions must agree. Changing a label does not recalculate a chart. Ask for a model/layout update when changing numbers or adding comparison options; ordinary wording edits need only YAML.

## Linking principles to stories

Edit a principle's title and explanation in `principles/`. Each has a stable `id`. Case files reference those IDs in their `principles:` list, in display order. Keep at least three distinct references per case. Do not rename an ID without updating its case references. Principles are stored once, so editing one updates every linked story.

## Recording and feedback

Set `video_card.video_link` in `05-video.yaml` when the recording is ready; the watch button then replaces the preparation message.

Feedback is thumbs-up/down only. Each visitor's browser remembers their vote. There is no comment form, email delivery or shared counter. Edit the question, button labels and acknowledgement in `09-feedback.yaml`. The contact email button remains separate.

## Check and publish

Run `pnpm run build` after editing. It validates content, references, navigation and carousel interactions. Pushing to `main` triggers the existing GitHub Pages deployment. Generated `dist/` files are not edited or committed.
