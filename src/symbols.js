const { WasmModule, binaryen, globalSymbolTable, symbolTable } = require('./shared.js')

class Symbol {
  constructor() {
    this.name = "$name";
    this.function = -1;
    this.symbolIndex = 0;
    this.type = binaryen.i32;
    this.initValue = 0;
    this.tokenIndexBegin = 0;
    this.tokenIndexEnd = 0;
  }
}
