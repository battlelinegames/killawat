"use strict";

// Object.freeze(obj);

const { TokenArray, funcSigTable, ParseTree,
  YELLOW, RED, CYAN, BRIGHT_GREEN, BRIGHT_BLUE,
  BRIGHT_YELLOW, BRIGHT_MAGENTA, BRIGHT_RED,
  WasmModule, binaryen, globalSymbolTable,
  functionTable, funcSymbolMap, BLUE, funcSymbolTable } = require('./shared.js')
const fs = require('fs');
const { tokenize } = require("./tokenizer.js");
//const { buildTables } = require('./tables.js');
const { Module } = require('./module.js');
const { Global } = require('./global.js');
const { Func } = require('./func.js');
const { Data } = require('./data.js');
const { Memory } = require('./memory.js');
const { Import } = require('./import.js');
//const { genParseTree, parseTree } = require('./parse.js');

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
  kwc version 0.0.18
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

  let module = new Module(TokenArray);

  module.globalExpressionTokens.forEach(tokenArray => new Global(tokenArray.slice(2, -1)));

  module.importExpressionTokens.forEach(tokenArray => new Import(tokenArray.slice(2, -1)));

  module.funcExpressionTokens.forEach(tokenArray => new Func(tokenArray.slice(1)));

  // data has to be done ahead of memory
  module.dataExpressionTokens.forEach(tokenArray => new Data(tokenArray.slice(2)));

  module.memoryExpressionTokens.forEach(tokenArray => new Memory(tokenArray.slice(2)));

  //buildTables(parseTree);

  //console.log(globalSymbolTable);

  //console.log('=================== FUNCTION SIGNATURES =====================');
  //console.log(JSON.stringify(funcSigTable, null, 2));

  // NOW THAT YOU HAVE THE TABLES BUILT, LOOK AT THE AST

  //  genBinaryenTree(parseTree);
  /*
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
  */

  let file_out = file_name.replace('.wat', '.wasm');
  console.log(BRIGHT_GREEN, `
  Output File: ${file_out}`);
  if (!WasmModule.validate()) console.log("validation error");
  fs.writeFileSync(file_out, WasmModule.emitBinary());

}

module.exports = { compile, log_error, log_support };