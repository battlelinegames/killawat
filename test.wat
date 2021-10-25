(module
  (func (param $should_I_branch i32)
    (block $jump_to_end
      local.get $should_I_branch
      br_if $jump_to_end
      
      ;; code below the branch will execute if $should_I_branch is 0
      nop
    )
    nop
  )
)
