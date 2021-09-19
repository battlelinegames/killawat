//const { consumeCount } = require('./tokenizer.js')
const binaryen = require('binaryen');

function isNumber(x) {
  return x === parseInt(x).toString();
}

module.exports.isNumber = isNumber;

module.exports.globalSymbols = [];

class GlobalSymbolTableEntry {
  constructor(name, type, index, mutable = false, export_name = null) {
    this.name = name;
    this.type = parseInt(type);
    this.index = parseInt(index);
    this.mutable = mutable;
    this.export_name = export_name;
  }
}

module.exports.GlobalSymbolTableEntry = GlobalSymbolTableEntry;

class SymbolTableEntry {
  constructor(name, type, index) {
    this.name = name;
    this.type = parseInt(type);
    this.index = parseInt(index);
  }
}

module.exports.SymbolTableEntry = SymbolTableEntry;

