const { RED, logError, globalSymbolTable, globalSymbolMap, binaryen, WasmModule } = require('./shared');


class Global {
  constructor(tokenArray) {
    this.meta = tokenArray.pop();

    this.index = globalSymbolTable.length;
    this.id = `$global_${this.index}`;
    this.globalType = binaryen.i32;
    this.mutable = false;
    this.initValue = WasmModule.i32.const(0);
    this.externalModuleName = null;
    this.externalBaseName = null;
    this.exportName = null;
    this.exportRef = null;

    for (let i = 0; i < tokenArray.length; i++) {
      let token = tokenArray[i];

      if (token.type === 'lp') {
        this.subExpression(tokenArray.slice(i + 1, i + token.endTokenOffset));
        i += token.endTokenOffset;
      }
      else if (token.type === 'name') {
        this.id = token.text;
      }
      else if (token.type === 'valtype') {
        this.globalType = token.value;
      }
    }

    if (this.externalModuleName != null && this.externalBaseName != null) {
      WasmModule.addGlobalImport(this.id.slice(1),
        this.externalModuleName, this.externalBaseName,
        this.globalType);
    }
    else if (this.exportName != null) {
      this.exportRef = WasmModule.addGlobalExport(this.id.slice(1), this.exportName);
    }
    else {
      this.expression = WasmModule.addGlobal(this.id.slice(1), this.globalType, this.mutable, this.initValue);
    }

    globalSymbolTable.push(this);
    globalSymbolMap.set(this.id, this);
  }

  subExpression(tokenArray) {
    if (tokenArray.length < 2) {
      logError(`global subexpression not followed by a valid keyword`, tokenArray[0]);
      return;
    }

    let token = tokenArray[0];
    let nextToken = tokenArray[1];

    if (token.text === 'mut') {
      if (nextToken.type !== 'valtype') {
        logError(`mut must be followed by a type such as i32, f32, i64 or f64`, nextToken);
        return;
      }
      this.mutable = nextToken.value;
    }
    else if (token.text === 'i32.const') {
      // int_literal, hex_literal, bin_literal
      if (nextToken.type === 'int_literal') {
        this.initValue = WasmModule.i32.const(nextToken.value);
      }
      else {
        logError(`i32.const must be followed by an integer literal`, nextToken);
        return;
      }
    }
    else if (token.text === 'f32.const' || token.text === 'f64.const') {
      // float_literal
      if (nextToken.type != 'float_literal') {
        this.initValue = WasmModule.f32.const(nextToken.value);
      }
      else {
        logError(`i32.const must be followed by an integer literal`, nextToken);
        return;
      }
    }
    else if (token.text === 'i64.const') {
      if (nextToken.type != 'int_literal' &&
        nextToken.type != 'hex_literal' &&
        nextToken.type != 'bin_literal') {
        this.initValue = WasmModule.i64.const(nextToken.value, nextToken.hival);
      }
      else {
        logError(`i32.const must be followed by an integer literal`, nextToken);
        return;
      }
    }
    else if (token.text === 'import') {
      if (tokenArray.length < 3 || nextToken.type !== 'string_literal' || tokenArray[2].type !== 'string_literal') {
        logError(`import requires an external name and a base name`, token);
        console.log(RED, `required 3 tokens but got ${tokenArray.length}
        param1.type: ${nextToken.type}
        param1.text: ${nextToken.text}
      `);
        ///        param2.type: ${tokenArray[2].type}

        return;
      }

      this.externalModuleName = tokenArray[2].text;;
      this.externalBaseName = nextToken.text;
    }
    else if (token.text === 'export') {
      if (nextToken.type !== 'string_literal') {
        logError(`export requires an export name`, token);
        return;
      }
      this.exportName = nextToken.value;
    }
    else {
      logError(`improper subexpression on global definition`, token);
      return;
    }
  }
}

module.exports.Global = Global;
