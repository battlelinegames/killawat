const binaryen = require('binaryen');
module.exports.binaryen = binaryen;

const WasmModule = new binaryen.Module();
module.exports.WasmModule = WasmModule;

const TokenArray = [];
module.exports.TokenArray = TokenArray;

// COLOR STUFF
const RED = '\x1b[31m%s\x1b[37m';
const WHITE = '\x1b[37m%s\x1b[37m';
const GREEN = '\x1b[32m%s\x1b[37m';
const YELLOW = '\x1b[33m%s\x1b[37m';
const BLUE = '\x1b[34m%s\x1b[37m';
const MAGENTA = '\x1b[35m%s\x1b[37m';
const CYAN = '\x1b[36m%s\x1b[37m'
const GRAY = '\x1b[90m%s\x1b[37m';
const BRIGHT_RED = '\x1b[91m%s\x1b[37m';
const BRIGHT_YELLOW = '\x1b[92m%s\x1b[37m';
const BRIGHT_GREEN = '\x1b[93m%s\x1b[37m';
const BRIGHT_BLUE = '\x1b[94m%s\x1b[37m';
const BRIGHT_MAGENTA = '\x1b[95m%s\x1b[37m';
const BRIGHT_CYAN = '\x1b[96m%s\x1b[37m';
const BRIGHT_WHITE = '\x1b[97m%s\x1b[37m';

module.exports.RED = RED;
module.exports.WHITE = WHITE;
module.exports.GREEN = GREEN;
module.exports.YELLOW = YELLOW;
module.exports.BLUE = BLUE;
module.exports.MAGENTA = MAGENTA;
module.exports.CYAN = CYAN;
module.exports.GRAY = GRAY;
module.exports.BRIGHT_RED = BRIGHT_RED;
module.exports.BRIGHT_YELLOW = BRIGHT_YELLOW;
module.exports.BRIGHT_GREEN = BRIGHT_GREEN;
module.exports.BRIGHT_BLUE = BRIGHT_BLUE;
module.exports.BRIGHT_MAGENTA = BRIGHT_MAGENTA;
module.exports.BRIGHT_CYAN = BRIGHT_CYAN;
module.exports.BRIGHT_WHITE = BRIGHT_WHITE;

module.exports.logError = function logError(caption, token) {
  if (token != null) {
    if (token.key == null) {
      console.log(RED, `
      ${caption}: "${token.text}"
        line: ${token.line} 
        column: ${token.col}
      `.replace(/^( ){2}/gm, ''));
    }
    else {
      console.log(RED, `
      ${caption}: "${token.key.text}"
        line: ${token.key.line} 
        column: ${token.key.col}
      `.replace(/^( ){2}/gm, ''));
    }
  }
  else {
    console.log(RED, `
    ${caption}.
    `.replace(/^( ){2}/gm, ''));
  }
}

// GLOBAL TABLES
const globalSymbolTable = [];
const globalSymbolMap = new Map();
module.exports.globalSymbolTable = globalSymbolTable;
module.exports.globalSymbolMap = globalSymbolMap;

// FUNCTION TABLES
const funcSymbolTable = [];
const funcSymbolMap = new Map();
module.exports.funcSymbolTable = funcSymbolTable;
module.exports.funcSymbolMap = funcSymbolMap;

// MEMORY TABLES
const memoryTable = [];
const memoryMap = new Map();
module.exports.memoryTable = memoryTable;
module.exports.memoryMap = memoryMap;

// WASM TABLES
const WasmTables = [];
const WasmTableMap = new Map();
module.exports.WasmTables = WasmTables;
module.exports.WasmTableMap = WasmTableMap;

const valtypeMap = new Map([
  ['i32', binaryen.i32],
  ['i64', binaryen.i64],
  ['f32', binaryen.f32],
  ['f64', binaryen.f64],
  ['v128', binaryen.v128],
  ['funcref', binaryen.funcref],
  ['anyref', binaryen.anyref],
  ['nullref', binaryen.nullref],
  ['externref', binaryen.externref],
  ['unreachable', binaryen.unreachable],
  ['auto', binaryen.auto],
  ['none', binaryen.none]
]);

module.exports.valtypeMap = valtypeMap;

const moduleDefinitions = [
  'module',
  'func',
  'table',
  'memory',
  'global',
  'elem',
  'data',
  'start',
  'import',
  'export'
];

module.exports.moduleDefinitions = moduleDefinitions;

class UnaryDef {
  constructor(paramType, resultType, binaryenFunc, text) {
    //this.productionType = PRODUCTION.UNARY;
    this.text = text;
    this.paramType = paramType;
    this.resultType = resultType;
    this.binaryenFunc = binaryenFunc;
  }
}

const constMap = new Map([
  ['i32.const', WasmModule.i32.const],
  ['f32.const', WasmModule.f32.const],
  ['f64.const', WasmModule.f64.const],
  ['i64.const', WasmModule.i64.const],
]);

module.exports.constMap = constMap;

const typeMap = new Map([
  ['i32', binaryen.i32],
  ['f32', binaryen.f32],
  ['f64', binaryen.f64],
  ['i64', binaryen.i64],
]);

module.exports.typeMap = typeMap;

const unaryMap = new Map();
const unaryArray = [
  new UnaryDef(binaryen.i32, binaryen.i32, WasmModule.i32.clz, 'i32.clz'),
  new UnaryDef(binaryen.i32, binaryen.i32, WasmModule.i32.ctz, 'i32.ctz'),
  new UnaryDef(binaryen.i32, binaryen.i32, WasmModule.i32.popcnt, 'i32.popcnt'),
  new UnaryDef(binaryen.i32, binaryen.i32, WasmModule.i32.eqz, 'i32.eqz'),
  new UnaryDef(binaryen.auto, binaryen.none, WasmModule.drop, 'drop'),
];

unaryArray.forEach(unary => { unaryMap.set(unary.text, unary) });
module.exports.unaryMap = unaryMap;
module.exports.unaryArray = unaryArray;

class BinaryDef {
  constructor(paramType1, paramType2, resultType, binaryenFunc, text) {
    //this.productionType = PRODUCTION.BINARY;
    this.text = text;
    this.paramType1 = paramType1;
    this.paramType2 = paramType2;
    this.resultType = resultType;
    this.binaryenFunc = binaryenFunc;
  }
}

const binaryMap = new Map();
const binaryArray = [
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.add, 'i32.add'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.sub, 'i32.sub'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.mul, 'i32.mul'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.and, 'i32.and'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.eq, 'i32.eq'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.gt_s, 'i32.gt_s'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.lt_s, 'i32.lt_s'),
];

binaryArray.forEach(binary => { binaryMap.set(binary.text, binary) });

module.exports.binaryArray = binaryArray;
module.exports.binaryMap = binaryMap;

var dataTable = [];
module.exports.dataTable = dataTable;
