if exists("g:loaded_prevmark")
  finish
endif
let g:loaded_prevmark = 1

command! -nargs=0 PrevMark lua require('prev-mark').prev_mark()
command! -nargs=0 PrevMarkTest lua require('prev-mark').run_test()
