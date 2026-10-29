// Post-build sanity check for dist/index.html and the content/ files.
// Catches the mistakes content edits typically cause: a missing field,
// a broken in-page link, an invalid colour, leftover template syntax.
// Exits with code 1 (failing `npm run build`) if anything is wrong.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";
import { loadContentFiles } from "./load-content.mjs";

const root = new URL("../", import.meta.url);
const htmlPath = fileURLToPath(new URL("dist/index.html", root));
const contentDir = fileURLToPath(new URL("content/", root));

const errors = [];
const fail = (msg) => errors.push(msg);

let html, entries;
try {
  entries = await loadContentFiles(contentDir);
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}
try {
  html = await readFile(htmlPath, "utf8");
} catch {
  console.error(`✗ ${htmlPath} not found. Run "npm run build" first.`);
  process.exit(1);
}

const byKey = Object.fromEntries(entries.map((e) => [e.key, e]));
const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
const isEmpty = (v) => v == null || String(v).trim() === "";

// Which fields each section file must have, and which lists need which fields per item.
const rules = {
  settings: { required: ["browser_tab_title", "accent_color"] },
  navigation: { required: ["name_first"], lists: { links: ["label", "link"] } },
  hero: {
    required: ["headline", "body", "primary_button.label", "primary_button.link"],
    lists: { "dilemma_card.options": ["title", "text"] },
  },
  stats_band: { lists: { stats: ["number", "label"] } },
  experience: { required: ["title"], lists: { case_studies: ["title", "summary"] } },
  video_and_meet: { required: ["video_card.title", "meet_card.title"] },
  approach: { required: ["title"], lists: { principles: ["title", "text"] } },
  about: { required: ["title", "body"] },
  contact: { required: ["title", "button.label", "button.link"] },
  footer: {},
};

// 1. Section files present, required fields filled, list items complete
for (const [key, rule] of Object.entries(rules)) {
  const entry = byKey[key];
  if (!entry) { fail(`content: no file for section "${key}" (expected something like content/NN-${key.replaceAll("_", "-")}.yaml)`); continue; }
  for (const field of rule.required ?? []) {
    if (isEmpty(get(entry.data, field))) {
      fail(`${entry.file}: "${field}" is missing or empty${field === "body" ? " (the text below the closing ---)" : ""}`);
    }
  }
  for (const [listPath, keys] of Object.entries(rule.lists ?? {})) {
    const list = get(entry.data, listPath);
    if (list == null) continue;
    if (!Array.isArray(list)) { fail(`${entry.file}: "${listPath}" should be a list (lines starting with "-")`); continue; }
    list.forEach((item, i) => {
      for (const k of keys) if (!item || isEmpty(item[k])) fail(`${entry.file}: ${listPath} item ${i + 1} is missing "${k}"`);
    });
  }
}

// 1b. Warnings (don't fail the build): unfinished placeholder principles
const warnings = [];
const principles = byKey.approach?.data?.principles ?? [];
const placeholders = principles.filter((p) => p?.placeholder).length;
if (placeholders) warnings.push(`${byKey.approach.file}: ${placeholders} principle(s) are still placeholders (placeholder: true)`);
if (Array.isArray(principles) && principles.length && !principles.some((p) => p?.show_on_page))
  warnings.push(`${byKey.approach.file}: no principle has show_on_page: true, so the "How I work" section shows no cards`);

// 2. Accent colour must be a hex colour
const accent = byKey.settings?.data?.accent_color;
if (accent && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(accent))) {
  fail(`${byKey.settings.file}: accent_color "${accent}" is not a hex colour like "#f2a93b"`);
}

// 3. No template leftovers or JS-ish junk in the output
const { document } = parseHTML(html);
const text = document.body.textContent;
for (const bad of ["{{", "}}", "{%", "%}", "undefined", "[object Object]", "NaN"]) {
  if (text.includes(bad)) fail(`output contains "${bad}" (a field is probably misspelt or the wrong type)`);
}

// 4. Document basics
if (!document.title.trim()) fail("page has no <title>");
if (document.querySelectorAll("h1").length !== 1) fail("page should have exactly one <h1>");

// 5. In-page links (#id) must point to an existing id; email links must look valid
const ids = new Set([...document.querySelectorAll("[id]")].map((el) => el.id));
for (const a of document.querySelectorAll("a[href]")) {
  const href = a.getAttribute("href");
  const label = a.textContent.trim() || "(no text)";
  if (!href) fail(`link "${label}" has an empty link`);
  else if (href.startsWith("#") && href.length > 1 && !ids.has(href.slice(1)))
    fail(`link "${label}" points to ${href}, but no section has id="${href.slice(1)}"`);
  else if (href.startsWith("mailto:") && !/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+/.test(href))
    fail(`link "${label}" has an invalid email address: ${href}`);
}

// 6. Sections the navigation relies on
for (const id of ["work", "approach", "connect"]) {
  if (!ids.has(id)) fail(`section #${id} is missing from the page`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  console.error(`✗ Check failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ Check passed: ${entries.length} content files, ${document.querySelectorAll("section").length} sections, ${document.querySelectorAll("a").length} links, ${(html.length / 1024).toFixed(1)} KB`);
