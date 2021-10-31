(module
 (type $none_=>_none (func))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (import "env" "log" (func $log))
 (global $dump (mut i32) (i32.const 0))
 (memory $0 1 1)
 (data (i32.const 0) "abcd")
 (data (i32.const 255) "bcde")
 (start $start_func)
 (func $loop_test (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local.set $2
   (i32.const 1)
  )
  (loop $continue
   (block $break
    (local.set $1
     (i32.add
      (local.get $1)
      (i32.const 1)
     )
    )
    (local.set $2
     (i32.mul
      (local.get $1)
      (local.get $2)
     )
    )
    (br_if $break
     (i32.eq
      (local.get $1)
      (local.get $0)
     )
    )
    (br $continue)
    (call $log)
   )
  )
  (local.get $2)
 )
 (func $start_func
  (global.set $dump
   (call $loop_test
    (i32.const 5)
   )
  )
 )
)