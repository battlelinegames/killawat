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

  new UnaryDef(binaryen.i64, binaryen.i64, WasmModule.i64.clz, 'i64.clz'),
  new UnaryDef(binaryen.i64, binaryen.i64, WasmModule.i64.ctz, 'i64.ctz'),
  new UnaryDef(binaryen.i64, binaryen.i64, WasmModule.i64.popcnt, 'i64.popcnt'),
  new UnaryDef(binaryen.i64, binaryen.i64, WasmModule.i64.eqz, 'i64.eqz'),



  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f32.neg, 'f32.neg'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f32.abs, 'f32.abs'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f32.ceil, 'f32.ceil'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f32.floor, 'f32.floor'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f32.trunc, 'f32.trunc'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f32.nearest, 'f32.nearest'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f32.sqrt, 'f32.sqrt'),

  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f64.neg, 'f64.neg'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f64.abs, 'f64.abs'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f64.ceil, 'f64.ceil'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f64.floor, 'f64.floor'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f64.trunc, 'f64.trunc'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f64.nearest, 'f64.nearest'),
  new UnaryDef(binaryen.f32, binaryen.f32, WasmModule.f64.sqrt, 'f64.sqrt'),

  new UnaryDef(binaryen.f32, binaryen.i32, WasmModule.i32.trunc_s.f32, 'i32.trunc_s.f32'),
  new UnaryDef(binaryen.f32, binaryen.i32, WasmModule.i32.trunc_u.f32, 'i32.trunc_u.f32'),
  new UnaryDef(binaryen.f32, binaryen.i32, WasmModule.i32.reinterpret.f32, 'i32.reinterpret.f32'),
  new UnaryDef(binaryen.f32, binaryen.i64, WasmModule.i64.trunc_s.f32, 'i64.trunc_s.f32'),
  new UnaryDef(binaryen.f32, binaryen.i64, WasmModule.i64.trunc_u.f32, 'i64.trunc_u.f32'),
  new UnaryDef(binaryen.f32, binaryen.f64, WasmModule.f64.promote.f32, 'f64.promote.f32'),
  new UnaryDef(binaryen.f64, binaryen.f32, WasmModule.f32.demote.f64, 'f32.demote.f64'),
  new UnaryDef(binaryen.f64, binaryen.i32, WasmModule.i32.trunc_s.f64, 'i32.trunc_s.f64'),
  new UnaryDef(binaryen.f64, binaryen.i32, WasmModule.i32.trunc_u.f64, 'i32.trunc_u.f64'),
  new UnaryDef(binaryen.f64, binaryen.i64, WasmModule.i64.trunc_s.f64, 'i64.trunc_s.f64'),
  new UnaryDef(binaryen.f64, binaryen.i64, WasmModule.i64.trunc_u.f64, 'i64.trunc_u.f64'),
  new UnaryDef(binaryen.f64, binaryen.i64, WasmModule.i64.reinterpret.f64, 'i64.reinterpret.f64'),

  new UnaryDef(binaryen.i32, binaryen.i64, WasmModule.i64.extend_s.i32, 'i64.extend_s.i32'),
  new UnaryDef(binaryen.i32, binaryen.i64, WasmModule.i64.extend_u.i32, 'i64.extend_u.i32'),
  new UnaryDef(binaryen.i32, binaryen.f32, WasmModule.f32.reinterpret.i32, 'f32.reinterpret.i32'),
  new UnaryDef(binaryen.i32, binaryen.f32, WasmModule.f32.convert_s.i32, 'f32.convert_s.i32'),
  new UnaryDef(binaryen.i32, binaryen.f32, WasmModule.f32.convert_u.i32, 'f32.convert_u.i32'),
  new UnaryDef(binaryen.i32, binaryen.f64, WasmModule.f64.convert_s.i32, 'f64.convert_s.i32'),
  new UnaryDef(binaryen.i32, binaryen.f64, WasmModule.f64.convert_u.i32, 'f64.convert_u.i32'),

  new UnaryDef(binaryen.i64, binaryen.i32, WasmModule.i32.wrap.i64, 'i32.wrap.i64'),
  new UnaryDef(binaryen.i64, binaryen.f32, WasmModule.f32.convert_s.i64, 'f32.convert_s.i64'),
  new UnaryDef(binaryen.i64, binaryen.f32, WasmModule.f32.convert_u.i64, 'f32.convert_u.i64'),
  new UnaryDef(binaryen.i64, binaryen.f64, WasmModule.f64.reinterpret.i64, 'f64.reinterpret.i64'),
  new UnaryDef(binaryen.i64, binaryen.f64, WasmModule.f64.convert_s.i64, 'f64.convert_s.i64'),
  new UnaryDef(binaryen.i64, binaryen.f64, WasmModule.f64.convert_u.i64, 'f64.convert_u.i64'),

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
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.div_s, 'i32.div_s'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.div_u, 'i32.div_u'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.rem_s, 'i32.rem_s'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.rem_u, 'i32.rem_u'),

  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.and, 'i32.and'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.or, 'i32.or'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.xor, 'i32.xor'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.shl, 'i32.shl'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.shr_s, 'i32.shr_s'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.shr_u, 'i32.shr_u'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.rotl, 'i32.rotl'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.rotr, 'i32.rotr'),

  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.eq, 'i32.eq'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.ne, 'i32.ne'),

  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.lt_s, 'i32.lt_s'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.lt_u, 'i32.lt_u'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.le_s, 'i32.le_s'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.le_u, 'i32.le_u'),

  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.gt_s, 'i32.gt_s'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.gt_u, 'i32.gt_u'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.ge_s, 'i32.ge_s'),
  new BinaryDef(binaryen.i32, binaryen.i32, binaryen.i32, WasmModule.i32.ge_u, 'i32.ge_u'),

  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.add, 'i64.add'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.sub, 'i64.sub'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.mul, 'i64.mul'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.div_s, 'i64.div_s'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.div_u, 'i64.div_u'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.rem_s, 'i64.rem_s'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.rem_u, 'i64.rem_u'),

  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.and, 'i64.and'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.or, 'i64.or'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.xor, 'i64.xor'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.shl, 'i64.shl'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.shr_s, 'i64.shr_s'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.shr_u, 'i64.shr_u'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.rotl, 'i64.rotl'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.rotr, 'i64.rotr'),

  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.eq, 'i64.eq'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.ne, 'i64.ne'),

  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.lt_s, 'i64.lt_s'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.lt_u, 'i64.lt_u'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.le_s, 'i64.le_s'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.le_u, 'i64.le_u'),

  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.gt_s, 'i64.gt_s'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.gt_u, 'i64.gt_u'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.ge_s, 'i64.ge_s'),
  new BinaryDef(binaryen.i64, binaryen.i64, binaryen.i64, WasmModule.i64.ge_u, 'i64.ge_u'),

  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.add, 'f32.add'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.sub, 'f32.sub'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.mul, 'f32.mul'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.div, 'f32.div'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.copysign, 'f32.copysign'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.min, 'f32.min'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.max, 'f32.max'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.eq, 'f32.eq'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.ne, 'f32.ne'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.lt, 'f32.lt'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.le, 'f32.le'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.gt, 'f32.gt'),
  new BinaryDef(binaryen.f32, binaryen.f32, binaryen.f32, WasmModule.f32.ge, 'f32.ge'),

  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.add, 'f64.add'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.sub, 'f64.sub'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.mul, 'f64.mul'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.div, 'f64.div'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.copysign, 'f64.copysign'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.min, 'f64.min'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.max, 'f64.max'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.eq, 'f64.eq'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.ne, 'f64.ne'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.lt, 'f64.lt'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.le, 'f64.le'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.gt, 'f64.gt'),
  new BinaryDef(binaryen.f64, binaryen.f64, binaryen.f64, WasmModule.f64.ge, 'f64.ge'),


];

binaryArray.forEach(binary => { binaryMap.set(binary.text, binary) });

module.exports.binaryArray = binaryArray;
module.exports.binaryMap = binaryMap;

class LoadDef {
  constructor(resultType, loadFunc, text) {
    //this.productionType = PRODUCTION.BINARY;
    this.resultType = resultType;
    this.loadFunc = loadFunc;
    this.text = text;
  }
}

const loadMap = new Map();
const loadArray = [
  new LoadDef(binaryen.i32, WasmModule.i32.load, 'i32.load'),
  new LoadDef(binaryen.i32, WasmModule.i32.load8_s, 'i32.load8_s'),
  new LoadDef(binaryen.i32, WasmModule.i32.load8_u, 'i32.load8_u'),
  new LoadDef(binaryen.i32, WasmModule.i32.load16_s, 'i32.load16_s'),
  new LoadDef(binaryen.i32, WasmModule.i32.load16_u, 'i32.load16_u'),

  new LoadDef(binaryen.i64, WasmModule.i64.load, 'i64.load'),
  new LoadDef(binaryen.i64, WasmModule.i64.load8_s, 'i64.load8_s'),
  new LoadDef(binaryen.i64, WasmModule.i64.load8_u, 'i64.load8_u'),
  new LoadDef(binaryen.i64, WasmModule.i64.load16_s, 'i64.load16_s'),
  new LoadDef(binaryen.i64, WasmModule.i64.load16_u, 'i64.load16_u'),
  new LoadDef(binaryen.i64, WasmModule.i64.load32_s, 'i64.load32_s'),
  new LoadDef(binaryen.i64, WasmModule.i64.load32_u, 'i64.load32_u'),

  new LoadDef(binaryen.f32, WasmModule.f32.load, 'f32.load'),

  new LoadDef(binaryen.f64, WasmModule.f64.load, 'f64.load'),
];

loadArray.forEach(l => { loadMap.set(l.text, l) });

module.exports.loadArray = loadArray;
module.exports.loadMap = loadMap;


class StoreDef {
  constructor(storeType, storeFunc, text) {
    //this.productionType = PRODUCTION.BINARY;
    this.storeType = storeType;
    this.storeFunc = storeFunc;
    this.text = text;
  }
}

const storeMap = new Map();
const storeArray = [
  new StoreDef(binaryen.i32, WasmModule.i32.store, 'i32.store'),
  new StoreDef(binaryen.i32, WasmModule.i32.store8, 'i32.store8'),
  new StoreDef(binaryen.i32, WasmModule.i32.store16, 'i32.store16'),

  new StoreDef(binaryen.i64, WasmModule.i64.store, 'i64.store'),
  new StoreDef(binaryen.i64, WasmModule.i64.store8, 'i64.store8'),
  new StoreDef(binaryen.i64, WasmModule.i64.store16, 'i64.store16'),
  new StoreDef(binaryen.i64, WasmModule.i64.store32, 'i64.store32'),

  new StoreDef(binaryen.f32, WasmModule.f32.store, 'f32.store'),

  new StoreDef(binaryen.f64, WasmModule.f64.store, 'f64.store'),
];

storeArray.forEach(s => { storeMap.set(s.text, s) });

module.exports.storeArray = storeArray;
module.exports.storeMap = storeMap;

var dataTable = [];
module.exports.dataTable = dataTable;
