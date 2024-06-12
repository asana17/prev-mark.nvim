# lua-preview.nvim

Open the current buffer Markdown in a Web browser.

## Install

- `lazy.nvim`

  ```lua
  local plugins = {
    {"asana17/prev-mark.nvim"},
  }
  ```

  Or you can use the local one.

  ```lua
  local plugins = {
    {"prev-mark", dir = "~/prev-mark.nvim"},
  }
  ```

## Before commit

Use `pre-commit`. Follow the [official Quick start][1].

Use [Conventional Commits][2].

[1]: https://pre-commit.com/index.html#quick-start
[2]: https://www.conventionalcommits.org/en/v1.0.0/
