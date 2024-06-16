# lua-preview.nvim

Open the current buffer Markdown in a Web browser with `:PrevMark`.

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

- Configuration Setup

  Following setup is using default values.

  ```lua
  require("prev-mark").setup(
    {
      verbose = false,
      server = {
        port = 8000,
        wait_limit = 1000, -- limit time in ms to wait for server to start
      },
      preview = {
        directory = "<plugin_dir>/.preview", -- directory to place preview temporaly files
        css = "<plugin_dir>/node/config/preview.css", -- CSS attached to the preview
        browse_command = "", -- command to start browser
      },
    }
  )
  ```

## Before commit

Use `pre-commit`. Follow the [official Quick start][1].

Use [Conventional Commits][2].

[1]: https://pre-commit.com/index.html#quick-start
[2]: https://www.conventionalcommits.org/en/v1.0.0/
