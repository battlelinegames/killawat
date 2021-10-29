const { RED, logError, valtypeMap, globalSymbolTable, globalSymbolMap,
  binaryen, WasmModule, funcSymbolTable, funcSymbolMap,
  memoryTable, memoryMap, WasmTables, WasmTableMap } = require('./shared');


class ImportTable {
  constructor(externalModuleName, externalBaseName, tableName, initialSize, maxSize) {
    this.externalModuleName = externalModuleName;
    this.externalBaseName = externalBaseName;
    this.name = tableName;
    this.initialSize = initialSize;
    this.maxSize = maxSize;

    // Module#addTableImport(internalName: string, externalModuleName: string, externalBaseName: string): void
    WasmModule.addTableImport(this.name,
      this.externalModuleName,
      this.externalBaseName
    );

  }
}

class ImportFunc {
  constructor(externalModuleName, externalBaseName, funcName, paramTypeArray, resultType) {
    this.externalModuleName = externalModuleName;
    this.externalBaseName = externalBaseName;
    this.name = funcName;
    this.params = paramTypeArray;
    this.result = resultType;

    this.index = funcSymbolTable.length;
    funcSymbolTable.push(this);
    funcSymbolMap.set(this.name, this);


    // Module#addFunctionImport(internalName: string, externalModuleName: string, 
    //  externalBaseName: string, params: Type, results: Type):

    WasmModule.addFunctionImport(this.name,
      this.externalModuleName,
      this.externalBaseName,
      binaryen.createType(this.params.map(s => s.type)),
      this.resultType
    );
  }
}

class ImportMem {
  constructor(externalModuleName, externalBaseName, memoryName, initialSize, maxSize) {
    this.externalModuleName = externalModuleName;
    this.externalBaseName = externalBaseName;
    this.name = memoryName;
    this.initialSize = initialSize;
    this.maxSize = maxSize;
    this.index = memoryTable.length;
    memoryTable.push(this);
    memoryMap.set(this.name, this);

    //Module#addMemoryImport(internalName: string, externalModuleName: string, externalBaseName: string): void
    WasmModule.addMemoryImport('0', // right now the memory name has to be '0'
      this.externalModuleName,
      this.externalBaseName,
    );
  }
}

class ImportGlobal {
  constructor(externalModuleName, externalBaseName, globalName, type) {
    this.externalModuleName = externalModuleName;
    this.externalBaseName = externalBaseName;

    this.id = globalName;
    this.globalType = type;
    this.index = globalSymbolTable.length;

    globalSymbolTable.push(this);
    globalSymbolMap.set(this.id, this);

    WasmModule.addGlobalImport(this.id,
      this.externalModuleName,
      this.externalBaseName,
      this.globalType
    );
  }
}

class Import {
  constructor(tokenArray) {
    // I THINK I WILL SLICE THESE TOKENS OUT
    /*
    if (tokenArray[0].type !== 'lp' ||
      tokenArray[1].text !== 'import') {
      logError('beginning of import is incorrect', tokenArray[0]);
      return;
    }
    */
    this.externalModuleName = tokenArray[0].value; //tokenArray[2].value;
    this.externalBaseName = tokenArray[1].value; // tokenArray[3].value;

    if (tokenArray[2].type !== 'lp') { // if you revert above swap 2 with 4
      logError(`expected '(' instead of ${tokenArray[2].text}`, tokenArray[2]);
      return;
    }

    this.importTypeToken = tokenArray[3];//[5];
    this.importType = this.importTypeToken.text;

    if (this.importType === 'func') {
      this.funcParams = [];
      this.parseFunc(tokenArray.slice(4, -2)); // if you revert above, the 4s will be 6s
    }
    else if (this.importType === 'memory') {
      this.parseMemory(tokenArray.slice(4, -2));
    }
    else if (this.importType === 'global') {
      this.parseGlobal(tokenArray.slice(4, -2));
    }
    else if (this.importType === 'table') {
      this.parseTable(tokenArray.slice(4, -2));
    }
    else {
      logError(`unknown import type ${this.importType}`, this.importTypeToken);
      return;
    }
  }

  parseFuncParam(tokenArray) {
    for (let i = 0; i < tokenArray.length; i++) {
      let type = valtypeMap.get(tokenArray[i].text)
      if (type == null) {
        logError(`expected valid Wasm type, instead found ${tokenArray[i].text}`, tokenArray[i]);
        return;
      }
      this.funcParams.push[type];
    }
  }

  parseFuncResult(tokenArray) {
    let typeToken = tokenArray[0];
    if (this.funcResult != undefined) {
      logError(`The result has already been set for this function`, typeToken);
      return;
    }

    if (tokenArray.length > 1) {
      logError(`functions can only have one result`, typeToken);
      return;
    }

    if (typeToken.type !== 'valtype') {
      logError(`expected valid Wasm type, instead found ${typeToken.text}`, typeToken);
      return;
    }

    this.funcResult = typeToken.value;

  }

  parseFunc(tokenArray) {
    // (func (param i32) (result i32)
    let startIndex = 0;
    this.funcName = `$func_${funcSymbolTable.length}`;
    if (tokenArray[0].type === 'name') {
      this.funcName = tokenArray[0].text;
      startIndex = 1;
    }

    for (let i = startIndex; i < tokenArray.length; i++) {
      if (tokenArray[i].type !== 'lp') {
        logError(`expected '(' token, found ${tokenArray[i].text}`, tokenArray[i]);
        return;
      }

      if (tokenArray[i + 1].text === 'param') {
        this.parseFuncParam(tokenArray.slice(i + 2, tokenArray[i].endTokenOffset + i));
        i += tokenArray[i].endTokenOffset;
      }
      else if (tokenArray[i + 1].text === 'result') {
        this.parseFuncResult(tokenArray.slice(i + 2, tokenArray[i].endTokenOffset + i));
        i += tokenArray[i].endTokenOffset;
      }
      else {
        logError(`unrecognized function attribute '${tokenArray[i + 1].text}'`, tokenArray[i]);
        return;
      }
    }
    this.importFunc = new ImportFunc(this.externalModuleName, this.externalBaseName, this.funcName,
      this.funcParams, this.funcResult);
  }

  parseMemory(tokenArray) {
    // (memory 1 2) | (memory $name 1 2)
    if (tokenArray.length === 0 || tokenArray.length > 3) {
      logError(`wrong number of arguments in memory import`,
        tokenArray[0]);
    }
    this.memoryName = `$mem_${memoryTable.length}`;
    let current_index = 0;
    if (tokenArray[current_index].type === 'name') {
      this.memoryName = tokenArray[current_index].value;
      current_index++;
    }

    this.initialMemPages = tokenArray[current_index].value;
    this.maxMemPages = tokenArray[current_index + 1] == undefined ?
      this.initialMemPages : tokenArray[current_index + 1].value;

    this.importMem = new ImportMem(
      this.externalModuleName,
      this.externalModuleName,
      this.memoryName,
      this.initialMemPages,
      this.maxMemPages);
  }

  parseGlobal(tokenArray) {
    // (global $x i32)
    let current_index = 0;
    if (tokenArray[current_index].type === 'name') {
      this.globalName = tokenArray[0].text;
      current_index++;
    }

    let typeToken = tokenArray[current_index];
    if (typeToken.type !== 'valtype') {
      logError(`expected type but found ${typeToken.text}`, typeToken);
      return;
    }

    this.globalType = typeToken.value;

    this.importGlobal = new ImportGlobal(
      this.externalModuleName,
      this.externalModuleName,
      this.globalName,
      this.globalType
    );
  }

  parseTable(tokenArray) {
    // (table $name 10 20 anyfunc)
    if (tokenArray.length === 0) {
      logError(`memory expression requires a minimum number of pages and can't have more than two values`,
        tokenArray[0]);
    }

    let current_index = 0;
    if (tokenArray[current_index].type === 'name') {
      this.tableName = tokenArray[current_index].text;
      current_index++;
    }

    this.initialTableEntries = tokenArray[current_index].value;
    this.maxTableEntries = tokenArray[current_index + 1] == undefined ?
      this.initialTableEntries : tokenArray[current_index + 1].value;
    // I'm assuming token 3 is anyfunc right now.

    // WasmTables, WasmTableMap

    /*
    this.importGlobal = new ImportGlobal(
      this.externalModuleName,
      this.externalModuleName,
      this.globalName,
      this.globalType
    );
    */

  }
}

module.exports.Import = Import;

/*
(module
  (import "spectest" "global_i32" (global i32))
  (import "spectest" "global_i32" (global $x i32))
  (import "test" "func-i32" (func (param i32)))
)
*/

/*
Module#addFunctionImport(internalName: string, externalModuleName: string, externalBaseName: string, 
      params: Type, results: Type): void

Module#addTableImport(internalName: string, externalModuleName: string, externalBaseName: string): void

Module#addMemoryImport(internalName: string, externalModuleName: string, externalBaseName: string): void

Module#addGlobalImport(internalName: string, externalModuleName: string, externalBaseName: string, 
  globalType: Type): void

*/