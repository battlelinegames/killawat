"use strict";

// Object.freeze(obj);

const { TokenArray, funcSigTable, ParseTree, main,
  YELLOW, RED, CYAN, BRIGHT_GREEN, BRIGHT_BLUE,
  BRIGHT_YELLOW, BRIGHT_MAGENTA, BRIGHT_RED,
  WasmModule, binaryen, globalSymbolTable,
  functionTable, funcSymbolMap, BLUE, funcSymbolTable } = require('./shared.js')
const fs = require('fs');
const { Tokenizer } = require("./tokenizer.js");
//const { buildTables } = require('./tables.js');
const { Module } = require('./module.js');
const { Global } = require('./global.js');
const { Func } = require('./func.js');
const { Memory, Data } = require('./memory.js');
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
  kwc version 0.0.22
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

// Don't forget about the misordering that can happen when a function doesn't return a value
// you need to add variables to hold the items with values on the stack.

function compile(file_name, flags) {
  console.log(BRIGHT_YELLOW, `compile ${file_name}`)
  var bytes = fs.readFileSync(file_name);
  var code = bytes.toString();

  //tokenize(code);
  let tokenizer = new Tokenizer(code, TokenArray);

  //let processedTokens = new Preprocess(tokenizer).tokens;

  let module = new Module(tokenizer, file_name);

  module.globalExpressionTokens.forEach(tokenArray => new Global(tokenArray.slice(2)));

  module.importExpressionTokens.forEach(tokenArray => new Import(tokenArray.slice(2)));

  module.funcExpressionTokens.forEach(tokenArray => new Func(tokenArray.slice(1)));

  // data has to be done ahead of memory
  module.memoryExpressionTokens.forEach(tokenArray => {
    let mem = new Memory(tokenArray.slice(2))
    if (main.fileName !== mem.fileName) {
      main.mem = mem;
    }
  });
  module.dataExpressionTokens.forEach(tokenArray => new Data(tokenArray.slice(2)));

  main.mem.Set();

  funcSymbolTable.forEach(func => { if (func.addFunction) { func.addFunction() } });

  if (module.startExpressionTokens.length > 0) {
    let startFunc = funcSymbolMap.get(module.startExpressionTokens[1].value);
    WasmModule.setStart(startFunc.funcRef);
  }

  // table
  // elem
  // exports

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

  // newModule is a workaround for an issue I had where directly emitting the binary
  // from WasmModule was screwing up the types for some reason.  I'm doing this until 
  // I have more time to look into why that was happening.
  let newModule = binaryen.parseText(WasmModule.emitText());
  fs.writeFileSync(file_out, newModule.emitBinary());

  //console.log(WasmModule.emitStackIR())
}

module.exports = { compile, log_error, log_support };