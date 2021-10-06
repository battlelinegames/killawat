const binaryen = require('binaryen');
module.exports.binaryen = binaryen;

var WasmModule = new binaryen.Module();
module.exports.WasmModule = WasmModule;

module.exports.TokenArray = [];

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

// FUNCTION TABLE STUFF
let functionTable = [];
module.exports.functionTable = functionTable;
let functionMap = new Map();
module.exports.functionMap = functionMap;


// SYMBOL TABLE STUFF
let globalSymbolTable = [];
module.exports.globalSymbolTable = globalSymbolTable;
let symbolTable = [[]];
module.exports.symbolTable = symbolTable;


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
// module|func|type|import|export|table|funcref|elem|global[^.]|memory
class State {
  static MODULE = 0;
  static FUNC = 1;
  static TYPE = 2;
  static IMPORT = 3;
  static EXPORT = 4;
  static TABLE = 5;
  static FUNC_REF = 6;
  static ELEM = 7;
  static GLOBAL = 8;
  static MEMORY = 9;
  static FUNC_BODY = 10;
  static currentState = State.MODULE;
  static name = "unknown";
  static index = 0;
}


module.exports.State = State;