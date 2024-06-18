--luacheck: globals vim
local config = require("prev-mark.config")
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

local function show_url(url)
    vim.cmd("split | wincmd j | resize 2 | ene | set buftype=nofile | call setline(1, \"" .. url.."\")")
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
  if not M.server:connect() then
    res = M.server:start_node_server()
    if not res then
      return
    end
    res = M.server:connect()
    if not res then
      return
    end
  end

  res = prev_file:write()
  if not res then
    return
  end
  local port = M.server:get_port()
  local buf_name = vim.api.nvim_buf_get_name(0)
  vim.cmd("au BufWritePost "..buf_name.." lua require('prev-mark.view').reload('"..buf_name.."', "..buf_num..")")
  vim.cmd("au BufWinLeave "..buf_name.." lua require('prev-mark.view').close('"..buf_name.."', "..buf_num..")")
  local url = "http://localhost:" .. port.."/"..prev_file:get_name()
  if config.options.preview.open_browser then
    utils.open_browser(url, utils.detect_os())
  end
  if config.options.preview.show_url then
    show_url(url)
  end
end

---@param buf_name string
---@param buf_num number
function M.reload(buf_name, buf_num)
  if buf_num ~= vim.fn.bufnr() then
    return
  end
  local prev_file = Prevfile.new(buf_name)
  if not prev_file then
    return
  end
  local res = prev_file:write()
  if not res then
    return
  end
end

---@param buf_name string
---@param buf_num number
function M.close(buf_name, buf_num)
  if buf_num ~= vim.fn.bufnr() then
    return
  end
  vim.cmd("au! BufWritePost "..buf_name)
  vim.cmd("au! BufWinLeave "..buf_name)
end

return M
