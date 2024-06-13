local config = require('prev-mark.config')
local test = require('prev-mark.test')

local M = {}

M.setup = config.setup
M.run_test = test.run

return M
