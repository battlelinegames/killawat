(module
  (memory 1)
  (data (i32.const 0) "xyza")
  (data (i32.const 0xff) "zyxa")

  (func $loadtest (export "loadtest") (result i32)
    i32.const 0xff
    i32.load 
  )
)
