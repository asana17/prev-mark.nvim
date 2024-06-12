local config = require("prev-mark.config")
local utils = require("prev-mark.utils")
local Server = require("prev-mark.server")

local test = {}

function test.init()
  utils.debug("This will not be shown.")
  config.options = vim.tbl_deep_extend("force", {}, config.options, {verbose = true})
  utils.debug("init")
end

function test.test_utils()
  utils.debug("test utils")
  utils.warn("Hello World!")
  utils.error("Hello World!")
  utils.debug(utils.detect_os())
  utils.debug(utils.get_plugin_dir())
  local script_dir = utils.get_script_dir()
  utils.debug(script_dir)
  -- if directory already exists, it will not create it again.
  -- also, it will not clear the directory when exiting nvim.
  utils.create_dir(script_dir, true)
  local temp_dir = script_dir .. "temp"
  utils.debug(temp_dir)
  utils.create_dir(temp_dir, true)
  assert(utils.exists(temp_dir) == true)
  assert(utils.write_file(temp_dir.."/test.txt", "Hello, world!", true) == true)
  assert(utils.exists(temp_dir.."/test.txt") == true)
end

function test.test_server()
  utils.debug("test_server")

  local filename = "simple_test.html"
  local simple_html = [[
  <html>
  <head>
  </head>
  <body>
    <p>Hello, world!</p>
  </body>
  </html>
  ]]

  local server = Server.new()
  assert(server ~= nil)
  assert(server:get_port() == config.options.server.port)
  assert(server:get_dir() == config.options.preview.directory)
  assert(utils.write_file(server:get_dir().."/"..filename, simple_html, true) == true)
  assert(server:status() == "stopped")
  assert(server:start_node_server() == true)
  utils.open_browser("http://localhost:8000/"..filename, utils.detect_os())
  server:debug()
  assert(server:status() == "running")
  -- this server automatically stops when nvim closes.
  -- if you want to check, reload browser tab.
end

function test.finish()
  utils.debug("finish")
  utils.debug("\":message\" shows previous logs.")
end

function test.run()
  test.init()
  test.test_utils()
  test.test_server()
  test.finish()
end

return test
