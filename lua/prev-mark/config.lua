--luacheck: globals vim
local M = {}

local plugin_dir = debug.getinfo(1, "S").source:sub(2):match("(.*)/lua/.*$")

---@class PrevOptions
local defaults = {
  ---@type boolean
  verbose = false,
  server = {
    ---@type integer
    port = 8000,
    wait_limit = 1000,
  },
  preview = {
    ---@type string
    directory = plugin_dir.."/.preview",
    ---@type string
    css = plugin_dir.."/node/config/preview.css",
    ---@type boolean
    open_browser = true,
    ---@type string
    browse_command = "",
    ---@type boolean
    show_url = false,
  },
}

---@type PrevOptions
M.options = {}

---@param options PrevOptions | nil
function M.setup(options)
  M.options = vim.tbl_deep_extend("force", defaults, options or {})
end

M.setup()

return M
