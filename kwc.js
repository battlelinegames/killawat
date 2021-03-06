const args = process.argv;
const RED = '\x1b[31m';
const WHITE = '\x1b[37m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

({ compile, log_support } = require('./src/killawat'));

if (args.length <= 2) {
  console.log(`
    Usage:
    ${YELLOW}kwc file.wat${WHITE}
    Creates file.wasm given a WebAssembly Text file
  
    ${YELLOW}kwc file.wat -o other.wasm${WHITE}
    Creates other.wasm WebAssembly file from file.wat.
      The -o flag allows you to specify an output file.
  
    Flags:
    ${YELLOW}--print-ft${WHITE} print the function table
    ${YELLOW}--print-fs${WHITE} print the function signature list
    ${YELLOW}--print-globals${WHITE} print the global variables
    ${YELLOW}--print-tree${WHITE} print the abstract syntax tree
    ${YELLOW}--tokens${WHITE} print the tokens
  
    ${RED}NONE OF THE FLAGS BELOW WORK YET
    ${YELLOW}-o${WHITE} is followed by an output file name);

    ${YELLOW}-O1${WHITE} minimal performance optmization
    ${YELLOW}-O2${WHITE} moderate performance optmization
    ${YELLOW}-O3${WHITE} maximum performance optmization

    ${YELLOW}-Os${WHITE} minimal size optmization
    ${YELLOW}-Oz${WHITE} maximum size optmization

    ${YELLOW}--exceptions${WHITE} exception handling (proposal)
    ${YELLOW}--mutable-globals${WHITE} import/export mutable globals (proposal)
    ${YELLOW}--sat-float-to-int${WHITE} non-trapping float-to-int conversion (proposal)
    ${YELLOW}--sign-extension${WHITE} sign-extension operators (proposal)
    ${YELLOW}--sign-extension${WHITE} sign-extension operators (proposal)
    ${YELLOW}--simd${WHITE} single instruction multiple data (proposal)
    ${YELLOW}--threads${WHITE} threads (proposal)
    ${YELLOW}--multi-value${WHITE} functions may return more than one value (proposal)
    ${YELLOW}--tail-call${WHITE} tail call optimization (proposal)
    ${YELLOW}--bulk-memory${WHITE} bulk memory copy and memory move (proposal)
    ${YELLOW}--reference-types${WHITE} improved interoperablility with host env (proposal)
    ${YELLOW}--annotations${WHITE} custom annotations (proposal)
    ${YELLOW}--gc${WHITE} garbage collection (proposal)
    `);

  log_support();

  return;
}

console.log(`
========================================================
  KILLA' WAT
========================================================
`);

let file = args[2];
if (file.endsWith('.wasm')) {
  log_error('kwc passed WASM file!!!');
  console.log(`
    USAGE:

      c file.wat
    `);
  return;
}

let flags = {
  print_function_table: false,
  print_symbol_table: false,
  print_tree: false,
  print_function_signatures: false,
  tokens: false
}

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--print-ft') {
    flags.print_function_table = true;
  }
  else if (args[i] === '--print-fs') {
    flags.print_function_signatures = true;
  }
  else if (args[i] === '--print-globals') {
    flags.print_symbol_table = true;
  }
  else if (args[i] === '--print-tree') {
    flags.print_tree = true;
  }
  else if (args[i] === '--tokens') {
    flags.tokens = true;
  }
}

compile(args[2], flags)

log_support();

