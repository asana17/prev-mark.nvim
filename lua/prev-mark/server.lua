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

---send request to server
---@param port integer
---@param endpoint string
---@param opt string|nil
---@return table {data: string, code: string}
local function request(port, endpoint, opt)
  local cmd = "curl -s -w '\\n%{response_code}\\n' -H 'Content-Type:application/json'"..
    " -X POST http://localhost:"..port.."/"..endpoint
  if opt then
    cmd = cmd .. " " .. opt
  end
  local handle = io.popen(cmd)
  local data, code
  if handle then
    data = handle:read("*l")
    code = handle:read("*l")
    handle:close()
  end
  local resp = {
    data = data,
    code = code,
  }
  return resp
end

---Create a new server object
---@return Server|nil
function Server.new()
  local res
  local obj = {port = config.options.server.port, dir = config.options.preview.directory}
  res = install_node_modules()
  if not res then
    return nil
  end
  return setmetatable(obj, {__index = Server})
end

---Connect to the server
---return true if success, nil otherwise
---@return boolean|nil
function Server:connect()
  vim.cmd("au VimLeavePre * lua require('prev-mark.server').disconnect_by_port(" .. self.port .. ")")
  local pid = vim.fn.getpid()
  local data = vim.fn.json_encode({pid = pid})
  local resp = request(self.port, "connect", "-d '" .. data .. "'")
  if resp.code == "200" then
    return true
  end
  return nil
end

---Disconnect from the server
---@param port integer
function Server.disconnect_by_port(port)
  local pid = vim.fn.getpid()
  local data = vim.fn.json_encode({pid = pid})
  request(port, "disconnect", "-d '" .. data .. "'")
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
  local res = utils.create_dir(self.dir, false)
  if not res then
    return nil
  end
  -- send sigterm when closing vim
  vim.cmd("au VimLeavePre * lua require('prev-mark.server').send_sigterm_by_port(" .. self.port .. ")")
  local handle, pid
  handle, pid = uv.spawn("node", {
    args = { node_dir.."server.js", self.port, self.dir },
    stdio = {nil, nil, nil},
  }, (function(_, _)
    if not handle then
      return
    end
    handle:close()
    handle = nil
  end))

  if not handle then
    utils.error("Failed to start server")
    return nil
  end

  vim.wait(2000, function() return self:status()~=nil end, 100)
  if self:status() == nil then
    utils.error("Failed to start server")
    Server.send_signal(pid, 15)
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

---return server status if success, nil if failed
---@return string|nil
function Server:status()
  local resp = request(self.port, "status", nil)
  if resp.code == "200" then
    return resp.data
  end
  return nil
end

---print server info
function Server:debug()
  utils.debug("port: " .. self.port)
  utils.debug("dir: " .. self.dir)
  local status = self:status()
  if status == nil then
    utils.debug("status: not running")
    return
  end
  utils.debug("status: running, nvim pids: " .. status)
end

return Server
