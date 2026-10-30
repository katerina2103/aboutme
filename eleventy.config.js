import markdownIt from "markdown-it";
import { loadContent } from "./scripts/load-content.mjs";

// Content is plain text with light Markdown: *italic*, **bold**, [links](url), lists.
// Raw HTML in content is escaped on purpose, so editors can't break the layout.
const md = markdownIt({ html: false, linkify: false, typographer: false });

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  // All files in content/ (one per page section) become the `site` variable.
  eleventyConfig.addGlobalData("site", () => loadContent("content"));
  eleventyConfig.addWatchTarget("./content/");

  // Block Markdown → <p>…</p> paragraphs and lists. Use for `body` text.
  eleventyConfig.addFilter("md", (value = "") => md.render(String(value ?? "")).trim());
  // Inline Markdown → no wrapping <p>. Use for headings and single lines.
  eleventyConfig.addFilter("mdInline", (value = "") => md.renderInline(String(value ?? "")));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "dist",
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
