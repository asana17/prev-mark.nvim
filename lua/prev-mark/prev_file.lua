--luacheck: globals vim
local config = require("prev-mark.config")
local File = require("prev-mark.file")
local utils = require("prev-mark.utils")

---@class PrevFile : File
local PrevFile = {
  path = nil,
  origin = nil,
}

---return path to preview file or nil if it cannot be created
---@param path string
---@return string|nil
function PrevFile.generate_prev_file_path(path)
  local file = File.new(path)
  if not file then
    utils.error("Cannot create preview file")
    return nil
  end
  if not file:is_markdown() then
    utils.error("Only markdown files are supported")
    return nil
  end
  local file_path = file:get_path()
  local prev_name = file_path:gsub("/", "_")
  return config.options.preview.directory.. "/"..prev_name..vim.fn.getpid().. ".html"
end

setmetatable(PrevFile, {__index = File})

---@param path string
---@return File|PrevFile|nil
function PrevFile.new(path)
  local prev_path = PrevFile.generate_prev_file_path(path)
  if not prev_path then
    return nil
  end
  local obj = File.new(prev_path)
  local res = utils.create_dir(config.options.preview.directory, true)
  if not res then
    return nil
  end
  obj.origin = path
  return setmetatable(obj, {__index = PrevFile})
end

---@return string
function PrevFile:get_path()
  return self.path
end

---get path to original file
---@return string
function PrevFile:get_origin()
  return self.origin
end

---convert markdown file to html and save it to preview file path
---return true if success, nil otherwise
---@return boolean|nil
function PrevFile:write()
  local convert_script = utils.get_plugin_dir() .. "/node/convert.js"
  local command =
    "node " .. convert_script .. " " .. self.origin .. " " ..config.options.preview.css .. " " .. self.path
  local res, err = pcall(os.execute, command)
  vim.cmd("redraw!")
  if not res then
    utils.error("Error while generating preview file: " .. err)
    return res
  end
  vim.cmd('au VimLeavePre * lua require("prev-mark.utils").delete_files("' .. self.path .. '")')
  return res
end

return PrevFile
