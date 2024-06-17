local config = require('prev-mark.config')
local view = require('prev-mark.view')

local M = {}

M.setup = config.setup
M.prev_mark = function()
  view.init()
  view.preview()
end

return M
