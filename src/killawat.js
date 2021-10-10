const { TokenArray, funcSigTable,
  YELLOW, RED, CYAN, BRIGHT_GREEN, BRIGHT_BLUE,
  BRIGHT_YELLOW, BRIGHT_MAGENTA, BRIGHT_RED,
  WasmModule, binaryen, globalSymbolTable, functionTable, BLUE } = require('./shared.js')
const fs = require('fs');
const { tokenize } = require("./tokenizer.js");
const { genParseTree, parseTree } = require('./parse.js');

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

/*
let flags = {
  print_function_table: false,
  print_symbol_table: false,
  print_tree: false,
  tokens: false
}
*/
function compile(file_name, flags) {
  console.log(BRIGHT_YELLOW, `compile ${file_name}`)
  var bytes = fs.readFileSync(file_name);
  var code = bytes.toString();
  tokenize(code);

  if (flags.tokens === true) {
    console.log(BRIGHT_MAGENTA,
      '\n================================ TOKENS ================================\n' +
      JSON.stringify(TokenArray, null, 2) +
      '\n========================================================================'
    );
  }

  if (flags.print_function_signatures == true) {
    console.log(BLUE,
      '\n========================= FUNCTION SIGNATURES ==========================\n' +
      JSON.stringify(funcSigTable, null, 2) +
      '\n========================================================================'
    );
  }

  genParseTree();

  if (flags.print_tree === true) {
    console.log(BRIGHT_YELLOW,
      '\n========================= ABSTRACT SYNTAX TREE =========================\n' +
      JSON.stringify(parseTree, null, 2) +
      '\n========================================================================'
    );
  }

  if (flags.print_symbol_table === true) {
    console.log(BRIGHT_BLUE,
      '\n========================= SYMBOL TABLE =================================\n' +
      JSON.stringify(globalSymbolTable, null, 2) +
      '\n========================================================================');
  }

  if (flags.print_function_table === true) {
    console.log(BRIGHT_RED,
      '\n========================= FUNCTION TABLE ===============================\n' +
      JSON.stringify(functionTable, null, 2) +
      '\n========================================================================'
    );
  }

  let file_out = file_name.replace('.wat', '.wasm');
  console.log(BRIGHT_GREEN, `
  Output File: ${file_out}`);
  fs.writeFileSync(file_out, WasmModule.emitBinary());
}

module.exports = { compile, log_error, log_support };