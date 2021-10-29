const fs = require('fs');
const binaryen = require('binaryen');

var WasmModule = new binaryen.Module();
WasmModule.addGlobal('$test', binaryen.i32, false, WasmModule.i32.const(0));

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
WasmModule.setMemory(1, 1, "exporting",
  [{ data: new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]), offset: WasmModule.i32.const(0xccff) }]
);

fs.writeFileSync("test.wasm", WasmModule.emitBinary());

/*
// FROM ASSEMBLYSCRIPT
export class MemorySegment {
  constructor(
    // Segment data. 
    public buffer: Uint8Array,
  // Segment offset. 
  public offset: i64
  ) { }
}


    module.setMemory(
      initialPages,
      maximumPages,
      this.memorySegments,
      options.target,
      options.exportMemory ? ExportNames.memory : null,
      isSharedMemory
    );

*/