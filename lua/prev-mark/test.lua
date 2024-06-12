local config = require("prev-mark.config")
local utils = require("prev-mark.utils")

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
end

function test.finish()
  utils.debug("finish")
  utils.debug("\":message\" shows previous logs.")
end

function test.run()
  test.init()
  test.test_utils()
  test.finish()
end

return test
