// i don't think this is right.  I think I need types and functions (perhaps)

// type
// operation
// module keyword?

// for more info look in wabt lexer-keywords.txt

const TOKENTYPE = {
  NOP: 0,
  UNARY: 1,
  BINARY: 2,
  BR: 4,
  CALL: 5,
  BLOCK: 6,
  ELEM: 7,
  END: 8,
  EXPORT: 9,
  FUNC: 10,
  GLOBAL: 11,
  GLOBALGET: 12,
  GLOBALSET: 13,
  CONST: 14,
  IMPORT: 15,
  LOCAL: 16,
  LOCALGET: 17,
  LOCALSET: 18,
  LOCALTEE: 19,
  LOOP: 20, // SHOULD THIS BE A BLOCK?
  PARAM: 21,
  QUOTE: 22,
  RESULT: 23,
  START: 24,
  TABLE: 25,
  THEN: 26,
  TYPE: 27,
  UNREACHABLE: 28,
  MODULE: 29,
}
// DID NOT INCLUDE (CONVERT, LOAD, STORE) TYPES

const keywordArray = [
  "module", "type", "func", "import", "export", "table", "param", "funcref", "elem",

  // CONTROL FLOW
  "block", "if", "else", "end", "then", "loop", "br", "br_if", "switch", "nop", "return",
  "unreachable", "drop", "select", "result",

  // VARIABLE
  "local.get", "get_local", "local.set", "set_local", "local.tee", "tee_local",

  "global.get", "get_global", "global.set", "set_global", "global.tee", "tee_global",
  "global", "local",

  // CONSTANTS
  "i32.const", "f32.const", "i64.const", "f64.const",
  // I32
  "i32.clz", "i32.ctz", "i32.popcnt", "i32.eqz", "i32.add", "i32.sub",
  "i32.mul",
  "i32", "i64", "f32", "f64"];

module.exports.keywordArray = keywordArray;

// THIS IS THE KEYWORD ENUMERATION
/*
const KEYWORDS = {
  module: 0, type: 1, func: 2, import: 3, export: 4, table: 5,
  param: 6, funcref: 7, elem: 8,

  // CONTROL FLOW
  block: 9, if: 10, else: 11, end: 12, then: 13, loop: 14,
  br: 15, br_if: 16, switch: 17, nop: 18, return: 19,
  unreachable: 20, drop: 21, select: 22, result: 23,

  // VARIABLE
  local_get: 24, local_set: 25, local_tee: 26,

  global_get: 27, global_set: 28, global: 29, local: 30,

  // CONSTANTS
  i32_const: 31, f32_const: 32, i64_const: 33, f64_const: 34,

  // I32
  i32_clz: 35, i32_ctz: 36, i32_popcnt: 37, i32_eqz: 38,
  i32_add: 39, i32_sub: 40, i32_mul: 41,

  // PURE TYPES
  i32: 42, i64: 43, f32: 44, f64: 45,
}
*/