--luacheck: globals vim
local utils = require("prev-mark.utils")
local Prevfile = require("prev-mark.prev_file")
local Server = require("prev-mark.server")

local M = {}

M.prev_files = {}
M.server = nil

function M.init()
  local buf_name = vim.api.nvim_buf_get_name(0)
  local buf_num = vim.fn.bufnr()
  local prev_file = Prevfile.new(buf_name)
  if not prev_file then
    return
  end
  M.prev_files[buf_num] = prev_file
  if not M.server then
    M.server = Server.new()
  end
end

function M.preview()
  local buf_num = vim.fn.bufnr()
  local prev_file = M.prev_files[buf_num]
  if not prev_file then
    return
  end

  if not M.server then
    return
  end
  local res
  if M.server:status() == "stopped" then
    res = M.server:start_node_server()
    if not res then
      return
    end
  end

  res = prev_file:write()
  if not res then
    return
  end
  utils.open_browser("http://localhost:" .. M.server:get_port().."/"..prev_file:get_name(), utils.detect_os())
end

return M
