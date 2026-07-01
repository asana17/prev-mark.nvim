// Render a Markdown file to HTML and open it in the browser for manual review.
//
//   npm run demo                 # renders test/fixtures/showcase.md
//   node demo.js path/to/file.md # renders any Markdown file
//
// Useful for eyeballing syntax highlighting, math, mermaid and CSS changes
// without starting Neovim.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const { generateHtml } = require("./convert");

const markdownPath =
  process.argv[2] || path.join(__dirname, "test", "fixtures", "showcase.md");
const cssPath = path.join(__dirname, "config", "preview.css");

const previewDir = path.join(__dirname, ".preview");
fs.mkdirSync(previewDir, { recursive: true });
const destPath = path.join(previewDir, "demo.html");

// Match the OS-detection used by the plugin (lua/prev-mark/utils.lua).
function browserOpener() {
  switch (os.platform()) {
    case "darwin":
      return "open";
    case "win32":
      return "start";
    default:
      return "xdg-open"; // Linux and friends
  }
}

generateHtml(markdownPath, cssPath, (html) => {
  fs.writeFileSync(destPath, html);
  console.log(`Rendered ${markdownPath}\n     ->  ${destPath}`);

  const opener = browserOpener();
  const child = spawn(opener, [destPath], { stdio: "ignore", detached: true });
  child.on("error", () => {
    console.log(`Could not launch "${opener}". Open this file manually:`);
    console.log(destPath);
  });
  child.unref();
});
