// read a markdown file and a css file, and generate an html file with the markdown content
// html file will automatically reload when updated

const fs = require("fs");
const { marked } = require("marked");
const { gfmHeadingId, resetHeadings } = require("marked-gfm-heading-id");
const path = require("path");

const {
  mermaidExtension,
  katexInlineExtension,
  katexBlockExtension,
  rewriteLocalPath,
} = require("./marked_extensions");

// Directory of the markdown file currently being converted. Used to resolve
// relative image/link paths; set by generateHtml before each parse.
let currentBaseDir = process.cwd();

marked.use({
  extensions: [mermaidExtension, katexInlineExtension, katexBlockExtension],
  // Rewrite local image/link targets to go through the preview server so they
  // load both locally and over an SSH port-forward. Mutating token.href lets
  // marked's default renderer keep doing all HTML escaping.
  walkTokens(token) {
    if ((token.type === "image" || token.type === "link") && token.href) {
      token.href = rewriteLocalPath(token.href, currentBaseDir);
    }
  },
});
// Give headings GitHub-compatible id slugs so in-page links like
// [x](#my-heading) resolve to the matching heading.
marked.use(gfmHeadingId());

function generateHtml(markdownFilePath, cssFilePath, callback) {
  let htmlContent = "<p>empty markdown file...<p>";
  if (fs.existsSync(markdownFilePath)) {
    // Resolve relative image/link paths against the markdown file's directory.
    currentBaseDir = path.dirname(path.resolve(markdownFilePath));
    // Clear heading-slug dedup state so ids don't accumulate across files.
    resetHeadings();
    const content = fs.readFileSync(markdownFilePath, "utf8");
    htmlContent = marked.parse(content);
  }

  const cssData = fs.readFileSync(cssFilePath, "utf8");
  const templatePath = path.join(__dirname, "config", "preview.html");
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file ${templatePath} does not exist`);
    process.exit(1);
  }
  const template = fs.readFileSync(templatePath, "utf8");

  const fullHtmlContent = template
    .replace("{{css}}", cssData)
    .replace("{{title}}", markdownFilePath)
    .replace("{{content}}", htmlContent)
    .replace("{{timeout}}", 100);

  callback(fullHtmlContent);
}

function main() {
  if (process.argv.length !== 5) {
    console.error(
      "Usage: node convert.js <markdown path> <css path> <destination path>",
    );
    process.exit(1);
  }
  const markdownFilePath = process.argv[2];
  const cssFilePath = process.argv[3];
  const destFilePath = process.argv[4];

  const destDir = path.dirname(destFilePath);
  if (!fs.existsSync(destDir)) {
    console.error(`Destination directory ${destDir} does not exist`);
    process.exit(1);
  }

  generateHtml(markdownFilePath, cssFilePath, (html) => {
    fs.writeFile(destFilePath, html, (err) => {
      if (err) {
        console.error(`Error writing file ${destFilePath}:`, err);
        process.exit(1);
      }
    });
  });
}

if (require.main === module) {
  main();
}

module.exports = { generateHtml };
