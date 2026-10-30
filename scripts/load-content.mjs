// Loads every section file in content/ into one `site` object.
//
//   content/02-hero.md          → site.hero
//   content/03-stats-band.yaml  → site.stats_band
//
// The leading number is dropped and dashes become underscores.
// .yaml files are parsed as-is. .md files: the frontmatter between the `---`
// lines becomes the fields, and the text below it becomes `body`.
// Used by both eleventy.config.js and scripts/check.mjs.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/;
const SKIP = /^(readme\.md|_.*)$/i;

export const keyFromFilename = (file) =>
  path.basename(file, path.extname(file)).replace(/^\d+[-_]/, "").replaceAll("-", "_");

/** @returns {Promise<Array<{ key: string, file: string, data: any }>>} */
export async function loadContentFiles(dir) {
  const names = (await readdir(dir))
    .filter((f) => /\.(ya?ml|md)$/i.test(f) && !SKIP.test(f))
    .sort();
  const seen = new Map();
  const entries = [];

  for (const file of names) {
    const rel = path.join(dir, file);
    const raw = await readFile(path.join(dir, file), "utf8");
    let data;
    try {
      if (/\.md$/i.test(file)) {
        const match = raw.match(FRONTMATTER);
        data = match
          ? { ...(YAML.parse(match[1]) ?? {}), body: (match[2] ?? "").trim() }
          : { body: raw.trim() };
      } else {
        data = YAML.parse(raw) ?? {};
      }
    } catch (err) {
      throw new Error(`${rel} could not be read: ${err.message}`);
    }
    if (typeof data !== "object" || Array.isArray(data)) {
      throw new Error(`${rel} should contain named fields (key: value) at the top level`);
    }
    const key = keyFromFilename(file);
    if (seen.has(key)) throw new Error(`${rel} and ${seen.get(key)} both define "${key}"; rename one`);
    seen.set(key, rel);
    entries.push({ key, file: rel, data });
  }
  return entries;
}

export async function loadContent(dir) {
  const site = {};
  for (const { key, data } of await loadContentFiles(dir)) site[key] = data;
  site.case_studies = {};
  for (const { key, data, file } of await loadContentFiles(path.join(dir, "case-studies"))) {
    for (const field of ["title", "context", "problem", "solution", "impact"]) {
      if (typeof data[field] !== "string" || !data[field].trim())
        throw new Error(`${file}: missing or invalid "${field}"`);
    }
    site.case_studies[key] = data;
  }
  site.principles = {};
  for (const { data, file } of await loadContentFiles(path.join(dir, "principles"))) {
    if (!data.id || !data.title || !data.text) throw new Error(`${file}: principle needs id, title and text`);
    if (site.principles[data.id]) throw new Error(`Duplicate principle ID: ${data.id}`);
    site.principles[data.id] = data;
  }
  site.lab_slides = {};
  for (const { key, data } of await loadContentFiles(path.join(dir, "decision-lab"))) site.lab_slides[key] = data;
  for (const card of site.experience.case_studies) {
    const detail = site.case_studies[card.detail];
    if (!detail) throw new Error(`Unknown case-study detail: ${card.detail}`);
    if (!Array.isArray(detail.principles) || detail.principles.length < 3) throw new Error(`${card.detail}: link at least three principles`);
    for (const id of detail.principles) if (!site.principles[id]) throw new Error(`${card.detail}: unknown principle ${id}`);
  }
  return site;
}
