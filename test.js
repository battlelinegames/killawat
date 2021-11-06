const fs = require('fs');
const binaryen = require('binaryen');

/* this worked.  Maybe come back to it
let data = fs.readFileSync("test.wasm", { encoding: "binary" });
let str = '';

for (let i = 0; i < data.length; i++) {
  str += '\\' + data[i].charCodeAt(0).toString(16).padStart(2, '0');
}

console.log(str);

fs.writeFileSync("hex.txt", str);
*/

let buf = fs.readFileSync("test.wasm", { encoding: "binary" });
let str = '';

for (let i = 0; i < buf.length; i++) {
  str += '\\' + buf[i].charCodeAt(0).toString(16).padStart(2, '0');
}

console.log(str);

fs.writeFileSync("out.txt", str);

/*
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

*/

//fs.writeFileSync("test.txt")
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