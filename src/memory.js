const { RED, logError, memoryTable, memoryMap, binaryen, main,
  WasmModule, dataTable, memoryOffsetMap } = require('./shared');

class Memory {
  static CURRENT_PAGE_OFFSET = 0;
  constructor(tokenArray) {
    this.meta = tokenArray.pop();
    this.fileName = this.meta.file;
    this.memOffset = Memory.CURRENT_PAGE_OFFSET << 16;

    memoryOffsetMap.set(this.meta.file, this.memOffset);

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

    if (main.module.fileName === this.fileName) {
      WasmModule.setMemory(this.initialSize + Memory.CURRENT_PAGE_OFFSET,
        this.maxSize + Memory.CURRENT_PAGE_OFFSET, null, dataTable);
    }
    else {
      Memory.CURRENT_PAGE_OFFSET += this.initialSize;
    }
  }
}

module.exports.Memory = Memory;