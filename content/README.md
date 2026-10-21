# Editing the content

One file per page section, numbered top to bottom as they appear on the page.

| File | Section on the page |
|---|---|
| `00-settings.yaml` | Tab title, search description, accent colour, animations on/off |
| `01-navigation.yaml` | Name in the top-left and the menu links |
| `02-hero.md` | Headline, buttons, dark "dilemma" card; the text under `---` is the intro |
| `03-stats-band.yaml` | Big numbers on the accent band |
| `04-experience.yaml` | "Decisions behind the outcomes" and the case studies |
| `05-video-and-meet.yaml` | Video card and "Meet Katya" card |
| `06-approach.yaml` | "How I work": all principles (cards + the "Explore" overlay) |
| `07-about.md` | About band; the text under `---` is the right-hand column |
| `08-contact.md` | "Let's work together" band; the text under `---` is the paragraph |
| `09-footer.yaml` | Footer lines |

## Two kinds of file

- **`.yaml`** for sections that are mostly fields and lists.
- **`.md`** for sections with running text. The top block between the two `---` lines
  holds the fields (written like YAML). Everything below it is the main text: write
  normally, with a blank line between paragraphs. `- bullet` lists work there too.

## Formatting inside any text

- `*words*` turns into the italic serif highlight used in headings
- `**words**` turns into bold
- `[label](https://…)` turns into a link

Raw HTML isn't allowed; it shows up as plain text.

## Good to know

- List items (lines starting with `-`) can be added, removed or reordered. Numbers like 01/02
  and the 1/2/3 badges follow the list order.
- The number in a file name only keeps the folder in page order. Moving a section on
  the page is done in `src/index.njk`.
- Put quotes around values that start with `#`, `*`, `@` or `[`, e.g. `link: "#work"`.
  Otherwise YAML reads them as comments or special syntax.
- After editing, run `npm run build`. The check will name the file and field if something's off.
