// read a markdown file and a css file, and generate an html file with the markdown content
// html file will automatically reload when updated

const fs = require("fs");
const { marked } = require("marked");
const path = require("path");

function generateHtml(markdownFilePath, cssFilePath, callback) {
  let htmlContent = "<p>empty markdown file...<p>";
  if (fs.existsSync(markdownFilePath)) {
    const content = fs.readFileSync(markdownFilePath, "utf8");
    htmlContent = marked.parse(content);
  }

  const cssData = fs.readFileSync(cssFilePath, "utf8");

  const fullHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
  ${cssData}
  </style>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${markdownFilePath}</title>
  <script type="text/javascript" src="https://livejs.com/live.js"></script>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
  </script>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
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

main();
