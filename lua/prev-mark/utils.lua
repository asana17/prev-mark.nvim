--luacheck: globals vim _
local config = require("prev-mark.config")

local M = {}

---@param msg string
---@param hl string
function M.log(msg, hl)
  vim.api.nvim_echo({{"prev-mark: ", hl}, {msg}}, true, {})
end

---output msg when verbose is true
---@param msg string
function M.debug(msg)
  if not config.options.verbose then
    return
  end
  vim.api.nvim_echo({{"prev-mark: ", "DebugMsg"}, {msg}}, true, {})
end

---@param msg string
function M.warn(msg)
  M.log(msg, "WarningMsg")
end

---@param msg string
function M.error(msg)
  M.log(msg, "ErrorMsg")
end

---@return string
function M.detect_os()
  if package.config:sub(1,1) == "\\" then
    return "Windows"
  end
  local os_name = io.popen("uname -s", "r"):read("*l")
  return os_name
end

---@param path string
---@return boolean
function M.exists(path)
  local res, code
  res, _, code = os.rename(path, path)
  if not res then
    if code == 13 then
      M.warn("Permission denied: " .. path)
      return true
    end
  end
  if not res then
    return false
  end
  return true
end

---return true if success, nil otherwise
---@param path string
---@param clean boolean if true, remove path when exiting vim
---@return boolean|nil
function M.create_dir(path, clean)
  if M.exists(path) then
    return true
  end
  local res, err
  res, err = pcall(os.execute, "mkdir -p " .. path)
  if not res then
    M.error("Failed to create directory: " .. path .. " " .. err)
    return res
  end
  if clean then
    -- auto delete directory when exiting vim
    vim.cmd('au VimLeavePre * lua require("prev-mark.utils").delete_files("' .. path .. '")')
  end
  res = true
  return res
end

---return true if success, nil otherwise
---@param path string
---@return boolean|nil
function M.delete_files(path)
  if not M.exists(path) then
    return true
  end
  local res, err
  res, err = pcall(os.execute, "rm -r " .. path)
  if not res then
    M.error("Failed to delete files: " .. path .. " " .. err)
    return res
  end
  res = true
  return res
end

---@return string
function M.get_script_dir()
  return debug.getinfo(1, "S").source:sub(2):match("(.*/)")
end

---@return string
function M.get_plugin_dir()
  return debug.getinfo(1, "S").source:sub(2):match("(.*/)lua/.*$")
end

---return true if success, nil otherwise
---@param path string
---@param content string
---@param clean boolean remove path when exiting vim or not
---@return boolean|nil
function M.write_file(path, content, clean)
  local res = nil
  local file = io.open(path, "w")
  if not file then
    M.error("Failed to open file: " .. path)
    return res
  end
  file:write(content)
  file:close()
  if clean then
    vim.cmd('au VimLeavePre * lua require("prev-mark.utils").delete_files("' .. path .. '")')
  end
  res = true
  return res
end

---@param url string
---@param os_name string
function M.open_browser(url, os_name)
  local browse_cmd = config.options.preview.browse_command
  if browse_cmd  == "" then
    if os_name == "Darwin" then
      browse_cmd = "open"
    elseif os_name == "Linux" then
      browse_cmd = "xdg-open"
    elseif os_name == "Windows" then
      browse_cmd = "start"
    else
      M.error("Unsupported OS" .. os_name)
      return
    end
  end
  vim.cmd("silent ! " .. browse_cmd.. " " .. url)
  vim.cmd("redraw!")
end

return M
