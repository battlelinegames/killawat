(module
    (global $a i32 (i32.const 5))
    (global $b (mut i32) (i32.const 0))
    (global $ex (mut i32) (export "ex") (i32.const 0))
    (func $addtest (export "AddInt")
      (param $value_1 i32) (param $value_2 i32)
      (result i32)
      (local $c i32)
      local.get $value_1
      local.get $value_2
      i32.add
    )

    (func $getglobal (export "getglobal") 
      (result i32)
      global.get $b
    )

    (func $calltest (export "calltest")
      (result i32)
      i32.const 1
      i32.const 2
      call $addtest
    )
)

