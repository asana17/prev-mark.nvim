--luacheck: globals vim
local M = {}

---@class PrevOptions
local defaults = {
  ---@type boolean
  verbose = false,
}

---@type PrevOptions
M.options = {}

---@param options PrevOptions | nil
function M.setup(options)
  M.options = vim.tbl_deep_extend("force", defaults, options or {})
end

M.setup()

return M
