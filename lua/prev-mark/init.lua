local config = require('prev-mark.config')
local view = require('prev-mark.view')
local test = require('prev-mark.test')

local M = {}

M.setup = config.setup
M.run_test = test.run
M.prev_mark = function()
  view.init()
  view.preview()
end

return M
