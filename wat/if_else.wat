(module
  (func (param $bool_i32 i32)
    ;; This code is for demonstration and not part of a larger app
    (if (local.get $bool_i32)
      (then
        ;; do something if $bool_i32 is not 0
        ;; nop is a "no operation" opcode.  
        nop ;; I use it to stand in for code that would actually do something.
      )
      (else
        ;; do something if $bool_i32 is 0
        nop
      )
    )

  )
)
