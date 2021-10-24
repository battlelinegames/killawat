(module
  (global $import_integer_32  (import "env" "import_i32") i32)
  (global $mut_32  (mut i32))
  (func $name (export "exportname") (param $bool_i32 i32)
    ;; This code is for demonstration and not part of a larger app

    local.get $bool_i32
    if
      ;; do something if $bool_i32 is not 0
      i32.const 5
      if
        (i32.const 86)
        drop
        nop ;; i32.const 1
      else
        nop 
      end;;*
    else
      ;; do something if $bool_i32 is 0
      nop ;; i32.const 5
    end

    i32.const 999
    nop 
    
    (if (i32.const 1)
      (then
        i32.const 2
        drop
      )
      (else
        nop
        nop
        nop
      )
    )

  )

  (func (export "export_func") (result i32) (local $a i32) (local $b i32)
    nop
    i32.const 90
  )
)


;; ELSE AND THEN NEED A BLOCK