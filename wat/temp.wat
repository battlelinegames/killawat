(module
  (type $t0 (func (param i32 i32) (result i32)))
  (func $f0 (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    (local $l2 i32)
    local.get $l2
    return)
  (global $g0 i32 (i32.const 5))
  (global $g1 (mut i32) (i32.const 0))
  (global $ex (mut i32) (i32.const 0))
  (export "ex" (global 2)))
