local utils = require("prev-mark.utils")

---@class File
local File = {
  path = nil,
}

---@return File
function File.new(path)
  local obj = {path = path}
  return setmetatable(obj, {__index = File})
end

---@return string
function File:get_path()
  return self.path
end

---@return boolean
function File:exists()
  return utils.exists(self.path)
end

---@return string
function File:get_dir_name()
  return string.match(self.path, ".*/")
end

---@return string
function File:get_name()
  return string.match(self.path, "[^/\\]+$")
end

---@return string
function File:get_identifier()
  local name = string.match(self.path, "[^/\\]+$")
  return string.match(name, "(.*)%..*$")
end

---@return boolean
function File:is_markdown()
  if string.match(self.path, "%.md$") then
    return true
  end
  return false
end

---return content if success, nil otherwise
---@return string|nil
function File:get_content()
  local res = nil
  local fd, _, _ = io.open(self.path, "r")
  if not fd then
    utils.error("Failed to open file: " .. self.path)
    return res
  end
  res = fd:read("*a")
  fd:close()
  if not res then
    utils.error("Failed to read file: " .. self.path)
  end
  return res
end

return File
