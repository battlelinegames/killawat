const fs = require('fs');
const binaryen = require('binaryen');

var WasmModule = new binaryen.Module();

let block = [];

let exp = WasmModule.i32.const(5)

block.push(WasmModule.local.set(1, exp));
block.push(WasmModule.local.get(1, binaryen.i32));

WasmModule.addFunction("$test",
  binaryen.createType([binaryen.i32]),
  binaryen.i32,
  [binaryen.i32],
  WasmModule.block(null, block)
);

fs.writeFileSync("test.wasm", WasmModule.emitBinary());