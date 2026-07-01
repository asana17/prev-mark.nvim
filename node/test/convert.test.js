// Tests for the Markdown -> HTML conversion pipeline.
// Run with: npm test  (uses the built-in `node --test` runner, no extra deps)

const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");

const { generateHtml } = require("../convert");
const {
  mermaidExtension,
  katexInlineExtension,
  katexBlockExtension,
} = require("../marked_extensions");

const cssPath = path.join(__dirname, "..", "config", "preview.css");
const showcasePath = path.join(__dirname, "fixtures", "showcase.md");

// Convert the showcase fixture once and reuse the HTML across assertions.
function render(markdownPath) {
  let out;
  generateHtml(markdownPath, cssPath, (html) => {
    out = html;
  });
  return out;
}

test("generateHtml produces a full HTML document from the template", () => {
  const html = render(showcasePath);
  assert.match(html, /<!DOCTYPE html>/);
  assert.match(html, /<\/html>\s*$/);
  // Template placeholders must all be substituted.
  assert.doesNotMatch(html, /\{\{css\}\}/);
  assert.doesNotMatch(html, /\{\{content\}\}/);
  assert.doesNotMatch(html, /\{\{title\}\}/);
  assert.doesNotMatch(html, /\{\{timeout\}\}/);
});

test("the CSS file is inlined into the document", () => {
  const html = render(showcasePath);
  const css = fs.readFileSync(cssPath, "utf8");
  const firstRule = css.split("\n").find((l) => l.trim().length > 0);
  assert.ok(html.includes(firstRule), "expected inlined CSS in output");
});

test("fenced code blocks get a language class for highlight.js", () => {
  const html = render(showcasePath);
  assert.match(html, /<pre><code class="language-javascript">/);
  assert.match(html, /<pre><code class="language-python">/);
  assert.match(html, /<pre><code class="language-rust">/);
  assert.match(html, /<pre><code class="language-lua">/);
});

test("bare code fences stay unlabeled so ASCII figures render as-is", () => {
  const html = render(showcasePath);
  // The figure characters survive untouched...
  assert.ok(html.includes("+-------------+"), "expected ASCII figure content");
  // ...inside a plain <pre><code> with no language class, so highlight.js
  // (which only targets language-* blocks) leaves it as plain monospace.
  assert.match(html, /<pre><code>\+-{13}\+/);
});

test("code content is HTML-escaped, not executed", () => {
  const html = render(showcasePath);
  // The template literal `${name}` etc. must survive as text.
  assert.match(html, /Hello, \$\{name\}/);
  // Angle brackets in code must be escaped.
  assert.doesNotMatch(html, /<script>alert/);
});

test("mermaid fences render as a mermaid div, not a code block", () => {
  const html = render(showcasePath);
  assert.match(html, /<div class="mermaid">/);
  assert.doesNotMatch(html, /language-mermaid/);
});

test("inline and block math render into KaTeX-targetable markup", () => {
  const html = render(showcasePath);
  assert.match(html, /<span class="math-inline">/);
  assert.match(html, /<div class="math-display">/);
});

test("an empty / missing markdown file yields a placeholder, not a crash", () => {
  const html = render(path.join(__dirname, "fixtures", "does-not-exist.md"));
  assert.match(html, /empty markdown file/);
});

// Unit-level checks of the custom marked extensions.

test("katexInlineExtension tokenizes and renders inline math", () => {
  const token = katexInlineExtension.tokenizer("$a+b$ rest");
  assert.equal(token.type, "latexInline");
  assert.equal(token.text, "a+b");
  assert.match(katexInlineExtension.renderer(token), /math-inline/);
});

test("katexBlockExtension tokenizes and renders block math", () => {
  const token = katexBlockExtension.tokenizer("$$x^2$$\nrest");
  assert.equal(token.type, "latexBlock");
  assert.equal(token.text, "x^2");
  assert.match(katexBlockExtension.renderer(token), /math-display/);
});

test("mermaidExtension tokenizes fenced mermaid blocks", () => {
  const token = mermaidExtension.tokenizer("```mermaid\ngraph TD;A-->B;\n```");
  assert.equal(token.type, "mermaid");
  assert.match(token.text, /graph TD/);
  assert.match(mermaidExtension.renderer(token), /class="mermaid"/);
});
