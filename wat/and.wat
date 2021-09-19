(module
  (func $test (param $x i32) (param $y i32)
    (local $z i32)
      (i32.and
        (i32.gt_s (local.get $x) (local.get $y) ) ;; signed greater than
        (i32.lt_s  (local.get $y) (i32.const 6) ) ;; signed less than
      )
      if
        ;; x is greater than y and y is less than 6
        nop
      end
    
  )
)


