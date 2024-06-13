-- luacheck: globals vim
local config = require("prev-mark.config")

local test = {}

function test.init()
  if config.options.verbose then
    vim.api.nvim_echo({{"test:", "Normal"}, {"This will be not shown by default."}}, true, {})
  end
  config.options = vim.tbl_deep_extend("force", {}, config.options, {verbose = true})
  if config.options.verbose then
    vim.api.nvim_echo({{"test:", "Normal"}, {"Hello, world!"}}, true, {})
  end
end

function test.finish()
  vim.api.nvim_echo({{"test:", "Normal"}, {"See you!"}}, true, {})
end

function test.run()
  test.init()
  test.finish()
end

return test
