-- luacheck: globals vim
local test = {}

function test.init()
  vim.api.nvim_echo({{"test:", "Normal"}, {"Hello, world!"}}, true, {})
end

function test.finish()
  vim.api.nvim_echo({{"test:", "Normal"}, {"See you!"}}, true, {})
end

function test.run()
  test.init()
  test.finish()
end

return test
