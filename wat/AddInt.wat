(module
    (func $addtest (export "AddInt")
    (param $value_1 i32) (param $value_2 i32)
    (result i32)
    (local $c i32)

      
      (i32.add
        (local.get $value_1)
        (local.get $value_2)
      )
      
      (i32.mul
        (i32.const 0xff_ff)
        (i32.const 2)
      )

        i32.sub
        i32.const 0b1111_1111 ;;0xff_ff_ff
        i32.add
        ;; local.set $c
    )
)

