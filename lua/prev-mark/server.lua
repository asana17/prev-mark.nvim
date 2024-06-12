--luacheck: globals vim
local utils = require("prev-mark.utils")
local config= require("prev-mark.config")
local uv = vim.loop

---@class Server
local Server = {
  port = nil,
  dir = nil,
}
local node_dir = utils.get_plugin_dir().."node/"

---install server dependencies
---return true if success, nil otherwise
---@return boolean|nil
local function install_node_modules()
  if utils.exists(node_dir.."node_modules") then
    return true
  end
  utils.warn("Installing node modules...")
  vim.fn.system("npm install --prefix "..node_dir)
  vim.cmd("redraw!")
  if not utils.exists(node_dir.."node_modules") then
    utils.error("Failed to install node_modules: " .. err)
    return nil
  end
  utils.warn("Success!")
  return true
end

---Create a new server object
---@return Server|nil
function Server.new()
  local res
  local obj = {handle = nil, pid = nil, port = config.options.server.port, dir = config.options.preview.directory}
  res = utils.create_dir(obj.dir, true)
  if not res then
    return nil
  end
  res = install_node_modules()
  if not res then
    return nil
  end
  return setmetatable(obj, {__index = Server})
end

---@return integer
function Server:get_port()
  return self.port
end

---@return string
function Server:get_dir()
  return self.dir
end

---return true if success, nil otherwise
---automatically close server when closing vim
---@return boolean|nil
function Server:start_node_server()
  -- send sigterm when closing vim
  vim.cmd("au VimLeavePre * lua require('prev-mark.server').send_sigterm_by_port(" .. self.port .. ")")
  self.handle, self.pid = uv.spawn("node", {
    args = { node_dir.."server.js", self.port, self.dir },
    stdio = {nil, nil, nil},
  }, (function(_, _)
    if not self.handle then
      return
    end
    self.handle:close()
    self.handle = nil
  end))

  if not self.handle then
    utils.error("Failed to start server")
    return nil
  end
  return true
end

---return pids if success, nil otherwise
---@param port integer
---@return string|nil
local function get_server_pids(port)
  local handle = io.popen("lsof -i:" .. port .. " -t")
  if not handle then
    utils.error("Failed to get server pid")
    return nil
  end
  local server_pids = handle:read("*a")
  handle:close()
  return server_pids
end

---@param pid integer|string
---@param signal integer
function Server.send_signal(pid, signal)
  os.execute("kill -"..signal.." " .. pid)
end

---find server by port, then send SIGTERM to the server
---@param port integer
function Server.send_sigterm_by_port(port)
  local server_pids = get_server_pids(port)
  if server_pids ~= "" then
    for server_pid in server_pids:gmatch("%d+") do
      Server.send_signal(server_pid, 15)
    end
  end
end

---return "running" or "stopped"
---@return string
function Server:status()
  if self.handle then
    return "running"
  else
    return "stopped"
  end
end

---print server info
function Server:debug()
  utils.debug("pid: " .. self.pid)
  utils.debug("port: " .. self.port)
  utils.debug("dir: " .. self.dir)
  utils.debug("status: " .. self:status())
end

return Server
