(module
    (func $addtest (export "AddInt")
    (param $value_1 i32) (param $value_2 i32)
    (result i32)
    (local $c i32)
      ;;(i32.add
      ;;  (local.get $value_1)
      ;;  (local.get $value_2)
      ;;)
        
        local.get $value_1
        local.get $value_2
        i32.add
        ;; local.set $c
    )
)
