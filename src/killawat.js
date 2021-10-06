const { TokenArray, YELLOW, RED, CYAN, BRIGHT_GREEN, BRIGHT_YELLOW, BRIGHT_MAGENTA, WasmModule, binaryen } = require('./shared.js')
const fs = require('fs');
const { tokenize } = require("./tokenizer.js");
const { genParseTree, parseTree } = require('./parse.js');
//const { FuncTableEntry } = require("./functionTable.js");
//const { SymbolTableEntry } = require("./symbolTable.js");
//const { Tree, IRBlock, createIRBlocks } = require("./parseAST.js");
//console.log(`killawatg.js IRBlock: ${IRBlock}`)

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
    console.log(BRIGHT_MAGENTA, JSON.stringify(TokenArray, null, 2));
  }

  genParseTree();

  if (flags.print_tree === true) {
    console.log(YELLOW, JSON.stringify(parseTree, null, 2));
  }
  /*
  var tree = new Tree(token_array);

  tree.buildTables()
  createIRBlocks();

  if (flags.print_tree === true) {
    tree.log();
  }

  if (flags.print_function_table === true) {
    FuncTableEntry.log();
  }

  if (flags.print_symbol_table === true) {
    SymbolTableEntry.logGlobalTable();
  }
  */

  let file_out = file_name.replace('.wat', '.wasm');
  console.log(BRIGHT_GREEN, `
  Output File: ${file_out}`);
  fs.writeFileSync(file_out, WasmModule.emitBinary());
}

module.exports = { compile, log_error, log_support };