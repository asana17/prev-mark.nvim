const path = require("path");

// URL prefix under which the preview server (server.js) serves arbitrary
// local files. Keep in sync with the route registered there.
const LOCAL_PREFIX = "/__local__";

// True for hrefs that point somewhere other than the local filesystem and so
// must be left untouched: http(s)/mailto/data/etc., protocol-relative URLs,
// and in-page anchors.
function isExternalHref(href) {
  return (
    !href ||
    /^[a-z][a-z0-9+.-]*:/i.test(href) || // http:, https:, mailto:, data:, tel:
    href.startsWith("//") || // protocol-relative
    href.startsWith("#") // in-page anchor
  );
}

// Rewrite a local (relative or absolute) path so the browser fetches it
// through the preview server's /__local__ route instead of resolving it
// against the served preview directory. `baseDir` is the directory of the
// source markdown file, used to resolve relative paths. External/remote
// hrefs are returned unchanged.
//
// Routing local files through the server (rather than file:// URLs) is what
// makes images and links work both locally and over an SSH port-forward.
function rewriteLocalPath(href, baseDir) {
  if (isExternalHref(href)) {
    return href;
  }
  const abs = path.resolve(baseDir, href);
  // Percent-encode each path segment but keep "/" as the separator so the
  // result stays a valid URL path.
  const encoded = abs.split("/").map(encodeURIComponent).join("/");
  return LOCAL_PREFIX + (encoded.startsWith("/") ? encoded : "/" + encoded);
}

const katexInlineExtension = {
  name: "latexInline",
  level: "inline",
  start(src) {
    return src.indexOf("$");
  },
  tokenizer(src) {
    const match = /^\$([^$]+?)\$/.exec(src);
    if (match) {
      return {
        type: "latexInline",
        raw: match[0],
        text: match[1],
        tokens: [], // required for inline-level tokens
      };
    }
  },
  renderer(token) {
    return `<span class="math-inline">\\(${token.text}\\)</span>`;
  },
};

const katexBlockExtension = {
  name: "latexBlock",
  level: "block",
  start(src) {
    return src.indexOf("$$");
  },
  tokenizer(src) {
    const match = /^\$\$([\s\S]+?)\$\$/.exec(src);
    if (match) {
      return {
        type: "latexBlock",
        raw: match[0],
        text: match[1].trim(),
        tokens: [], // required for block-level tokens
      };
    }
  },
  renderer(token) {
    return `<div class="math-display">$$$${token.text}$$$</div>`;
  },
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

module.exports = {
  mermaidExtension,
  katexInlineExtension,
  katexBlockExtension,
  isExternalHref,
  rewriteLocalPath,
  LOCAL_PREFIX,
};
