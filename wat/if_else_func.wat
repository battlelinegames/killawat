(module
  (global $import_integer_32  (import "env" "import_i32") i32)
  (global $mut_32  (mut i32))
  (func $name (export "exportname") (param $bool_i32 i32)
    ;; This code is for demonstration and not part of a larger app

    local.get $bool_i32
    if 
        nop
        nop
        i32.const 1
        if  ;; NESTED IF IS NOT WORKING!!!!!!!
          i32.const 5
          drop
        end
    else
        ;; do something if $bool_i32 is 0
        (if (i32.const 1)
          (then 
            i32.const 7
            drop
          )
          (else
            i32.const 8
            drop
          )
        )
        nop ;; i32.const 5
    
    end
  )
;;
  (func (export "export_func") (result i32) (local $a i32) (local $b i32)
    i32.const 92
    call $name
    i32.const 1
  )
)


;; ELSE AND THEN NEED A BLOCK