(module
  (import "env" "log" (func $log (param i32 i32)))
  (!merge "test_import.wat")
  (memory 1)
  (data (i32.const 0) "abcd")
  (data (i32.const 0xff) "bcde")
  (!inline $filedata 512 "card.json" (!process "./spriteSheetData.js"))
  (global $dump (mut i32) (i32.const 0))

  (func $loop_test (export "loop_test") (param $n i32)
    (result i32)

    (local $i         i32)
    (local $factorial i32)
    
    (local.set $factorial (i32.const 1))

    (loop $continue (block $break	;; $continue loop and $break block
      (local.set $i            	;; $i++	
        (i32.add (local.get $i) (i32.const 1))
      )

      ;; value of $i factorial
      (local.set $factorial ;; $factorial = $i * $factorial	
        (i32.mul (local.get $i) (local.get $factorial))
      )
	
      ;; call $log passing parameters $i, $factorial
      (call $log (local.get $i) (local.get $factorial))
      
      (br_if $break
        (i32.eq (local.get $i) (local.get $n)));;if $i==$n break from loop
      br $continue        ;; branch to top of loop
    ))

    local.get $factorial  ;; return $factorial to calling JavaScript
  )

  (func $start_func
    ;;(call $log (i32.const 1) (i32.const 2))
    (global.set $dump
      (call $loop_test (i32.const 5))
    )
  )

  (func $NoExport (result i32) 
    (local $x i32) 
    (local $y i32)
    i32.const 0x01
    i32.load 
    local.set $x
    !inc $x ;; macro didn't do anything yet
    local.get $x
    local.set $y
    !inc $y
    local.get $y
  )

  (start $start_func)
)
