// read a markdown file and a css file, and generate an html file with the markdown content
// html file will automatically reload when updated

const fs = require("fs");
const { marked } = require("marked");
const path = require("path");

const katexInlineExtension = {
  name: 'latexInline',
  level: 'inline',
  start(src) {
    return src.indexOf('$');
  },
  tokenizer(src) {
    const match = /^\$([^\$]+?)\$/.exec(src);
    if (match) {
      return {
        type: 'latexInline',
        raw: match[0],
        text: match[1],
        tokens: [],  // required for inline-level tokens
      };
    }
  },
  renderer(token) {
    return `<span class="math-inline">\\(${token.text}\\)</span>`;
  }
};

const katexBlockExtension = {
  name: 'latexBlock',
  level: 'block',
  start(src) {
    return src.indexOf('$$');
  },
  tokenizer(src) {
    const match = /^\$\$([\s\S]+?)\$\$/.exec(src);
    if (match) {
      return {
        type: 'latexBlock',
        raw: match[0],
        text: match[1].trim(),
        tokens: [],  // required for block-level tokens
      };
    }
  },
  renderer(token) {
    return `<div class="math-display">$$$${token.text}$$$</div>`;
  }
};

const mermaidExtension = {
  name: "mermaid",
  level: "block",
  start(src) {
    return src.match(/```mermaid/)?.index;
  },
  tokenizer(src) {
    const match = /^```mermaid\s*([\s\S]*?)```/.exec(src);
    if (match) {
      return {
        type: "mermaid",
        raw: match[0],
        text: match[1].trim(),
        tokens: [], // no inline tokens
      };
    }
  },
  renderer(token) {
    return `<div class="mermaid">${token.text}</div>`;
  },
};

marked.use({
  extensions: [mermaidExtension, katexInlineExtension, katexBlockExtension] });

function generateHtml(markdownFilePath, cssFilePath, callback) {
  let htmlContent = "<p>empty markdown file...<p>";
  if (fs.existsSync(markdownFilePath)) {
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

main();
