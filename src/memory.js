const { RED, logError, memoryTable, memoryMap, binaryen, WasmModule, dataTable } = require('./shared');

class Memory {
  constructor(tokenArray) {
    let currentIndex = 0;
    this.name = `mem_${memoryTable.length}`;
    this.index = memoryTable.length;

    let token = tokenArray[currentIndex];

    if (token.type === 'name') {
      this.name = token.value;
      token = tokenArray[++currentIndex];
    }

    if (token == null && token.type !== 'int_literal') {
      logError(`memory requires an initialization size, not ${token.text}`, token);
      return;
    }

    this.initialSize = token.value;
    token = tokenArray[++currentIndex];

    if (token != null && token.type === 'int_literal') {
      this.maxSize = token.value;
    }
    else {
      this.maxSize = this.initialSize;
    }

    WasmModule.setMemory(this.initialSize, this.maxSize, null, dataTable);
  }
}

module.exports.Memory = Memory;