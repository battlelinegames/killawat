const binaryen = require("binaryen");
var WasmModule = new binaryen.Module();
module.exports.binaryen = binaryen;
module.exports.WasmModule = WasmModule;

const { tokenize } = require("./tokenizer.js");
const { funcToken, functionTable, buildFuncExpression,
  buildBlockTokenStack, buildBlockExpressions } = require('./function.js');
const fs = require('fs');


const RED = '\x1b[31m%s';
const CYAN = '\x1b[36m%s';
const BRIGHT_MAGENTA = '\x1b[95m%s';
const BRIGHT_YELLOW = '\x1b[93m%s';
const BRIGHT_GREEN = '\x1b[92m%s';
/*
const GREEN = '\x1b[32m%s';
const YELLOW = '\x1b[33m%s';
const BLUE = '\x1b[34m%s';
const MAGENTA = '\x1b[35m%s';
const WHITE = '\x1b[37m%s';
const GRAY = '\x1b[90m%s';
const BRIGHT_RED = '\x1b[91m%s';
const BRIGHT_BLUE = '\x1b[94m%s';
const BRIGHT_CYAN = '\x1b[96m%s';
const BRIGHT_WHITE = '\x1b[97m%s';
*/
function log_error(error_string) {
  console.log(RED, `
    ===================================================================================
    ERROR: ${error_string}
    ===================================================================================
  `);
}

function log_support() {
  console.log(
    CYAN,
    `
  Need help?  
  Contact Rick Battagline
  Twitter: @battagline
  https://wasmbook.com
  v0.1.1
  `);

}

var function_expressions = [];

function compile(file_name) {
  console.log(`compile ${file_name}`)
  var bytes = fs.readFileSync(file_name);
  var code = bytes.toString();
  var token_array = tokenize(code);
  // console.log(token_array);

  for (let i = 0; i < token_array.length; i++) {
    let token = token_array[i];
    // BUILD GLOBAL TABLE HERE
    if (token.type === 'keyword' && token.value === 'func') {
      funcToken(token_array, i);
    }
  }

  for (let i = 0; i < functionTable.length; i++) {
    buildBlockTokenStack(functionTable[i]);
    //console.log('**buildBlockTokenStack');
    //console.log(functionTable[i]);
    buildBlockExpressions(functionTable[i]);
    //console.log('***buildBlockExpressions');
    //console.log(functionTable[i]);
    buildFuncExpression(functionTable[i]);
    //console.log('****buildFuncExpression');
    //console.log(functionTable[i]);
  }

  if (!WasmModule.validate()) {
    throw new Error("validation error");
  }

  // something is wrong with emitText()
  //console.log(WasmModule.emitText());
  let file_out = file_name.replace('.wat', '.wasm');
  console.log(BRIGHT_GREEN, `Output File: ${file_out}`);
  fs.writeFileSync(file_out, WasmModule.emitBinary());
}
module.exports = { compile, log_error, log_support };