# prev-mark.nvim

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
        open_browser = true, -- open browser if true, otherwise do not open
        browse_command = "", -- command to start browser
        show_url = false, -- show the preview file URL in the small window
      },
    }
  )
  ```

## Preview on remote server

Access preview URL from local browser. This requres following steps.

Specify following configuration:

```lua
require("prev-mark").setup(
  {
    server = {
      port = 8001,
    },
    preview = {
      open_browser = false, -- do not open the browser
      show_url = true, -- show the url in the small window
    },
  }
)
```

Connect remote server with ssh port forwarding:

```bash
ssh -L 8001:localhost:8001 user@remote
```

To suppress the `open` error from `ssh`, use quiet option `-q`.

```config
Host remote
  HostName remote
  User user
  RemoteForward 8001 localhost:8001
  LogLevel QUIET
```

## Before commit

Use `pre-commit`. Follow the [official Quick start][1].

```
pre-commit install -t pre-commit -t commit-msg
```

Use [Conventional Commits][2].

[1]: https://pre-commit.com/index.html#quick-start
[2]: https://www.conventionalcommits.org/en/v1.0.0/
