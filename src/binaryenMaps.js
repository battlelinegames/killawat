const { WasmModule, binaryen, logError } = require('./shared.js')

// i32\.const|f32\.const|i64\.const|f64\.const|nop|unreachable
var binaryenTerminalMap = new Map();
binaryenTerminalMap.set('global.get', WasmModule.global.get);
binaryenTerminalMap.set('local.get', WasmModule.local.get);

binaryenTerminalMap.set('i32.const', WasmModule.i32.const);
binaryenTerminalMap.set('f32.const', WasmModule.f32.const);
binaryenTerminalMap.set('f64.const', WasmModule.f64.const);
binaryenTerminalMap.set('i64.const', WasmModule.i64.const);

binaryenTerminalMap.set('nop', WasmModule.nop);
binaryenTerminalMap.set('unreachable', WasmModule.unreachable);

module.exports.binaryenTerminalMap = binaryenTerminalMap;

var binaryenUnaryMap = new Map();

module.exports.binaryenUnaryMap = binaryenUnaryMap;
binaryenUnaryMap.set('i32.clz', WasmModule.i32.clz);
binaryenUnaryMap.set('i32.ctz', WasmModule.i32.ctz);
binaryenUnaryMap.set('i32.popcnt', WasmModule.i32.popcnt);
binaryenUnaryMap.set('i32.eqz', WasmModule.i32.eqz);

// /i32.add|i32.sub|i32.mul|i32.and/
var binaryenBinaryMap = new Map();
binaryenBinaryMap.set('i32.add', WasmModule.i32.add);
binaryenBinaryMap.set('i32.sub', WasmModule.i32.sub);
binaryenBinaryMap.set('i32.mul', WasmModule.i32.mul);
binaryenBinaryMap.set('i32.and', WasmModule.i32.and);

module.exports.binaryenBinaryMap = binaryenBinaryMap;

binaryenUnaryMap.set('local.set', WasmModule.local.set);
binaryenUnaryMap.set('global.set', WasmModule.global.set);
