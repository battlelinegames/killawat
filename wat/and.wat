(module
  (global $a i32 (i32.const 3))
  (global $b f32 (f32.const 2))
  (global $c f64 (f64.const 1))
  (func $test (param $x i32) (param $y i32)
    (local $z i32)
      (i32.and
        (i32.gt_s (local.get $x) (local.get $y) ) ;; signed greater than
        (i32.lt_s  (local.get $y) (i32.const 6) ) ;; signed less than
      )
      if
        ;; x is greater than y and y is less than 6
        i32.const 5
        drop
        nop
      end
    
  )
)


