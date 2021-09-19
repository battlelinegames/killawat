const { functionMap } = require("./symboltable.js")
const moo = require("moo");
const binaryen = require("binaryen");

class DATA_TYPE {
  static NONE = binaryen.none;
  static I32 = binaryen.i32;
  static I64 = binaryen.i64;
  static F32 = binaryen.f32;
  static F64 = binaryen.f64;
  static V128 = binaryen.v128;
  static FUNCREF = binaryen.funcref;
  static ANY = binaryen.auto;
}

module.exports.DATA_TYPE = DATA_TYPE;

class VarType {
  var_name = "";
  data_type = DATA_TYPE.NONE;
  constructor(var_name, data_type) {
    this.var_name = var_name;
    this.data_type = data_type;
  }
}

var global_map = new Map();
var local_map = new Map();
var function_map = new Map();

const lexer = moo.compile({
  WS: /[ \t]+/,
  lp: "(",
  rp: ")",
  comma: ",",
  lbracket: "[",
  rbracket: "]",
  lbrace: "{",
  rbrace: "}",
  assignment: "=",
  plus: "+",
  minus: "-",
  multiply: "*",
  divide: "/",
  modulo: "%",
  colon: ":",
  comment: {
    match: /;;[^\n]*/,
    value: s => s.substring(1)
  },
  string_literal: {
    match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/,
    value: s => JSON.parse(s)
  },
  int_literal: {
    match: /[0-9][0-9_]*/,
    value: s => s
  },
  float_literal: {
    match: /[0-9][0-9_]*\.[0-9][0-9_]*/,
    value: s => s
  },
  hex_literal: {
    match: /0x[0-9a-fA-F][0-9a-fA-F_]*/,
    value: s => s
  },
  bin_literal: {
    match: /0b[01][01_]*/,
    value: s => s
  },
  name: {
    match: /\$[a-z_][a-z_0-9]*/,
    value: s => s
  },
  keyword: [
    "module", "type", "func", "import", "export", "table", "memory", "param",

    // CONTROL FLOW
    "block", "if", "else", "end", "then", "loop", "br", "br_if", "switch", "nop", "return",
    "unreachable", "drop", "select", "result",

    // VARIABLE
    "local.get", "get_local", "local.set", "set_local", "local.tee", "tee_local",

    "global.get", "get_global", "global.set", "set_global", "global.tee", "tee_global",

    "global", "local",

    // I32
    "i32.const", "i32.clz", "i32.ctz", "i32.popcnt", "i32.eqz", "i32.add", "i32.sub",
    "i32.mul", "i32.div_s", "i32.div_u", "i32.rem_s", "i32.rem_u", "i32.and", "i32.or",
    "i32.xor", "i32.shl", "i32.shr_s", "i32.shr_u", "i32.rotl", "i32.rotr", "i32.eq", "i32.ne",

    "i32.lt_s", "i32.lt_u", "i32.le_s", "i32.le_u",

    "i32.gt_s", "i32.gt_u", "i32.ge_s", "i32.ge_u",

    // I64
    "i64.const", "i64.clz", "i64.ctz", "i64.popcnt", "i64.eqz", "i64.add", "i64.sub",
    "i64.mul", "i64.div_s", "i64.div_u", "i64.rem_s", "i64.rem_u", "i64.and", "i64.or",
    "i64.xor", "i64.shl", "i64.shr_s", "i64.shr_u", "i64.rotl", "i64.rotr", "i64.eq", "i64.ne",

    "i64.lt_s", "i64.lt_u", "i64.le_s", "i64.le_u",

    "i64.gt_s", "i64.gt_u", "i64.ge_s", "i64.ge_u",

    // F32
    "f32.const", "f32.neg", "f32.abs", "f32.ceil", "f32.floor", "f32.trunc", "f32.nearest",
    "f32.sqrt", "f32.add", "f32.sub", "f32.mul", "f32.div", "f32.copysign", "f32.min",
    "f32.max", "f32.eq", "f32.ne", "f32.lt", "f32.le", "f32.gt", "f32.ge",

    // F64
    "f64.const", "f64.neg", "f64.abs", "f64.ceil", "f64.floor", "f64.trunc", "f64.nearest",
    "f64.sqrt", "f64.add", "f64.sub", "f64.mul", "f64.div", "f64.copysign", "f64.min",
    "f64.max", "f64.eq", "f64.ne", "f64.lt", "f64.le", "f64.gt", "f64.ge",

    // I32 DATATYPE CONVERSION
    "i32.trunc_s.f32", "i32.trunc_s/f32", "i32.trunc_s[f32]", "i32.trunc_s_f32", "i32.trunc_f32_s",

    "i32.trunc_s.f64", "i32.trunc_s/f64", "i32.trunc_s[f64]", "i32.trunc_s_f64", "i32.trunc_f64_s",

    "i32.trunc_u.f32", "i32.trunc_u/f32", "i32.trunc_u[f32]", "i32.trunc_u_f32", "i32.trunc_f32_u",

    "i32.trunc_u.f64", "i32.trunc_u/f64", "i32.trunc_u[f64]", "i32.trunc_u_f64", "i32.trunc_f64_u",

    "i32.reinterpret", "i32.reinterpret.f32", "i32.reinterpret/f32",
    "i32.reinterpret[f32]", "i32.reinterpret_f32",

    "i32.wrap", "i32.wrap.i64", "i32.wrap/i64", "i32.wrap[i64]", "i32.wrap_i64",

    // I64 DATATYPE CONVERSION
    "i64.trunc_s.f32", "i64.trunc_s/f32", "i64.trunc_s[f32]", "i64.trunc_s_f32", "i64.trunc_f32_s",

    "i64.trunc_s.f64", "i64.trunc_s/f64", "i64.trunc_s[f64]", "i64.trunc_s_f64", "i64.trunc_f64_s",

    "i64.trunc_u.f32", "i64.trunc_u/f32", "i64.trunc_u[f32]", "i64.trunc_u_f32", "i64.trunc_f32_u",

    "i64.trunc_u.f64", "i64.trunc_u/f64", "i64.trunc_u[f64]", "i64.trunc_u_f64", "i64.trunc_f64_u",

    "i64.reinterpret", "i64.reinterpret.f64", "i64.reinterpret/f64", "i64.reinterpret[f64]",
    "i64.reinterpret_f64",

    "i64.extend_s", "i64.extend_s.i32", "i64.extend_s/i32", "i64.extend_s[i32]",
    "i64.extend_s_i32", "i64.extend_i32_s",

    "i64.extend_u", "i64.extend_u.i32", "i64.extend_u/i32", "i64.extend_u[i32]",
    "i64.extend_u_i32", "i64.extend_i32_u",

    // F32 DATATYPE CONVERSION
    "f32.reinterpret", "f32.reinterpret.i32", "f32.reinterpret/i32", "f32.reinterpret[i32]",
    "f32.reinterpret_i32",

    "f32.convert_s", "f32.convert_s.i32", "f32.convert_s/i32", "f32.convert_s[i32]",
    "f32.convert_s_i32", "f32.convert_i32_s",

    "f32.convert_s", "f32.convert_s.i64", "f32.convert_s/i64", "f32.convert_s[i64]",
    "f32.convert_s_i64", "f32.convert_i64_s",

    "f32.convert_u", "f32.convert_u.i32", "f32.convert_u/i32", "f32.convert_u[i32]",
    "f32.convert_u_i32", "f32.convert_i32_u",

    "f32.convert_u", "f32.convert_u.i64", "f32.convert_u/i64", "f32.convert_u[i64]",
    "f32.convert_u_i64", "f32.convert_i64_u",

    "f32.demote", "f32.demote.f64", "f32.demote/f64", "f32.demote[f64]", "f32.demote_f64",

    // F64 DATATYPE CONVERSION
    "f64.reinterpret", "f64.reinterpret.i64", "f64.reinterpret/i64", "f64.reinterpret[i64]",
    "f64.reinterpret_i64", "f64.convert_s.i32", "f64.convert_s/i32", "f64.convert_s[i32]",
    "f64.convert_s_i32", "f64.convert_i32_s",

    "f64.convert_s.i64", "f64.convert_s/i64", "f64.convert_s[i64]",
    "f64.convert_s_i64", "f64.convert_i64_s",

    "f64.convert_u.i32", "f64.convert_u/i32", "f64.convert_u[i32]",
    "f64.convert_u_i32", "f64.convert_i32_u",

    "f64.convert_u.i64", "f64.convert_u/i64", "f64.convert_u[i64]",
    "f64.convert_u_i64", "f64.convert_i64_u",

    "f64.promote", "f64.promote.f32", "f64.promote/f32", "f64.promote[f32]", "f64.promote_f32",

    // FUNCTION CALLS
    "call", "call_indirect",

    // I32 LINEAR MEMORY
    "i32.load", "i32.load8_s", "i32.load8_u", "i32.load16_s", "i32.load16_u",

    "i32.store", "i32.store8", "i32.store16",

    // I64 LINEAR MEMORY
    "i64.load", "i64.load8_s", "i64.load8_u", "i64.load16_s", "i64.load16_u", "i64.load32_s", "i64.load32_u",

    "i64.store", "i64.store8", "i64.store16", "i64.store32",

    // F32 LINEAR MEMORY
    "f32.load", "f32.store",

    // F64 LINEAR MEMORY
    "f64.load", "f64.store",

    "i32", "i64", "f32", "f64",

  ],
  NL: { match: /[\n\r]+/, lineBreaks: true },
});


function result(keyword, next_token) {
  if (keyword === "if" ||
    keyword === "br_if") {
    return DATA_TYPE.I32;
  }
  else if (keyword === "local.get" ||
    keyword === "get_local") {
    // this needs to be looked up
    return DATA_TYPE.ANY;
  }
  else if (keyword === "global.get" ||
    keyword === "get_global") {
    // this needs to be looked up
    return DATA_TYPE.ANY;
  }
  else if (keyword === "call" ||
    keyword === "call_indirect") {
    // this needs to be looked up
    return DATA_TYPE.ANY;
  }
  else if (keyword.substring(0, 9) === "i32.store" ||
    keyword.substring(0, 9) === "i64.store") {
    return DATA_TYPE.NONE;
  }

  switch (keyword.substring(0, 4)) {
    // I32
    case "i32.":
      return DATA_TYPE.I32;
    // I64
    case "i64.":
      return DATA_TYPE.I64;
    // F32
    case "f32.":
      return DATA_TYPE.F32;
    // F64
    case "f64.":
      return DATA_TYPE.F64;
    // F32 LINEAR MEMORY
    default: break;

  }
}

module.exports.result = result;

module.exports.tokenize = function tokenize(code) {
  lexer.reset(code);
  let token = lexer.next()
  let token_arr = [];

  while (token != null) {
    /*
    if (token.type !== 'WS') {
      if (token.type === 'keyword') {
        token.consume = consumeArray(token.value);
        token.result = result(token.value);
      }
      token_arr.push(token);
    }
    */
    token_arr.push(token);
    token = lexer.next();
  }
  //console.log(token_arr);
  return token_arr;
}

/*
    type: moo.keywords({
      func: "func",
      module: "module",
    })
*/