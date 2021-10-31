(module
 (type $none_=>_none (func))
 (type $i32_=>_i32 (func (param i32) (result i32)))
 (import "env" "log" (func $fimport$0))
 (memory $0 1 1)
 (data (i32.const 0) "abcd")
 (data (i32.const 255) "bcde")
 (global $global$0 (mut i32) (i32.const 0))
 (start $1)
 (func $0 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local.set $2
   (i32.const 1)
  )
  (loop $label$1
   (block $label$2
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
    (br_if $label$2
     (i32.eq
      (local.get $1)
      (local.get $0)
     )
    )
    (br $label$1)
   )
  )
  (local.get $2)
 )
 (func $1
  (global.set $global$0
   (call $0
    (i32.const 5)
   )
  )
 )
)
