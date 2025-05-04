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

module.exports = {
  mermaidExtension,
  katexInlineExtension,
  katexBlockExtension,
};
