const { logError, moduleStack, importedModules, moduleMap, main, YELLOW, GREEN, macroMap, macroTable } = require("./shared");
const { Tokenizer } = require("./tokenizer");
const fs = require('fs');
const binaryen = require("binaryen");

const ParamType = {
  LOCAL: 0,
  GLOBAL: 1,
  CONST: 2,
}

class Macro {
  constructor(tokenArray) {
    let token = tokenArray[0] || {};
    if (token.type !== 'macro_name') {
      logError(`!macro must be followed by a macro name`, token);
      return;
    }
    this.name = token.value;
    this.paramArray = [];
    this.body = "";

    for (let i = 1; i < tokenArray.length; i++) {
      token = tokenArray[i];
      let nextToken = tokenArray[i + 1] || {};
      if (token.type === 'lp') {
        if (nextToken.text === '!local' ||
          nextToken.text === '!const' ||
          nextToken.text === '!global') { // !local|!const|!global|!body
          this.parseParam(tokenArray.slice(i + 1, i + token.endTokenOffset));
        }
        else if (nextToken.text === '!body') {
          this.body = tokenArray.slice(i + 2, i + token.endTokenOffset);
        }
      }
    }
  }

  parseParam(tokenArray) {
    let token = tokenArray[0];
    let nameToken = tokenArray[1] || {};
    let typeToken = tokenArray[2] || {};

    if (nameToken.type !== 'name') {
      logError('!local must be followed by a name', nameToken);
      return;
    }
    if (typeToken.type !== 'valtype') {
      logError('!local must include a type', typeToken);
      return;
    }

    if (token.text === '!local') {
      this.paramArray.push({
        paramType: ParamType.LOCAL,
        name: nameToken.text,
        type: typeToken.value,
      });
    }
    else if (token.text === '!const') {
      this.paramArray.push({
        paramType: ParamType.CONST,
        name: nameToken.text,
        type: typeToken.value,
      });
    }
    else if (token.text === '!global') {
      this.paramArray.push({
        paramType: ParamType.GLOBAL,
        name: nameToken.text,
        type: typeToken.value,
      });
    }
  }


}

class Preprocess {
  constructor(tokenizer, fileName) {
    let tokenArray = tokenizer.tokenArray;
    let processedTokens = [];
    let processedIndex = 0;
    this.importedModules = [];
    this.fileName = fileName;

    for (let i = 0; i < tokenArray.length; i++) {
      let prevToken = tokenArray[i - 1] || {};
      let token = tokenArray[i];
      let nextToken = tokenArray[i + 1] || {};

      if (token.type === 'preprocess') {
        // !merge|!macro|!module|!private|!mem|!inline|!address|!len|!process|##|#
        switch (token.text) {
          case '!merge':
            if (prevToken.type !== 'lp') {
              logError(`!merge preprocessor directive must be preceeded by '('`, prevToken);
              return;
            }
            this.processImport(tokenArray.slice(i + 1, i + prevToken.endTokenOffset));
            break;
          case '!macro':
            if (prevToken.type !== 'lp') {
              logError(`!macro preprocessor directive must be preceeded by '('`, prevToken);
              return;
            }
            this.processMacro(tokenArray.slice(i + 1, i + prevToken.endTokenOffset), processedTokens);
            break;
          case '!inline':
            if (prevToken.type !== 'lp') {
              logError(`!inline preprocessor directive must be preceeded by '('`, prevToken);
              return;
            }
            this.processInline(tokenArray.slice(i + 1, i - 1 + prevToken.endTokenOffset), processedTokens);
            break;
          case '!process':
            if (prevToken.type !== 'lp') {
              logError(`!process preprocessor directive must be preceeded by '('`, prevToken);
              return;
            }
            break;
          default:
            logError(`preprocessor directive ${token.text} found in wrong location`, token);
        }
      }
      else {
        token.processedIndex = processedIndex++;
        processedTokens.push(token);
      }
    }

    this.tokens = processedTokens;
  }

  processImport(tokenArray) {
    let i = 0;

    for (let i = 0; i < tokenArray.length; i++) {
      let token = tokenArray[i];
      if (token.type === 'rp') {
        break;
      }

      if (token.type !== 'string_literal') {
        logError(`!merge preprocessor command must be followed by a string literal`, token);
        return;
      }

      let file_name = token.value;
      if (!moduleMap.get(file_name)) {
        console.log(GREEN, `importing file: ${file_name}`);
        var bytes = fs.readFileSync(file_name);
        var code = bytes.toString();

        let importTokens = [];
        let tokenizer = new Tokenizer(code, importTokens)
        // not sure what to do with importTokens

        let module = new Module(tokenizer, file_name);
        this.importedModules.push(module);

        if (main.fileName !== module.fileName) {
          module.funcExpressionTokens.forEach(exp => main.module.funcExpressionTokens.push(exp));
          module.globalExpressionTokens.forEach(exp => main.module.globalExpressionTokens.push(exp));
          module.importExpressionTokens.forEach(exp => main.module.importExpressionTokens.push(exp));

          // how to tie data expressions to memory, how to tie memory to file
          module.memoryExpressionTokens.forEach(exp => main.module.memoryExpressionTokens.push(exp));
          module.dataExpressionTokens.forEach(exp => main.module.dataExpressionTokens.push(exp));
        }
      }
    }
  }

  processMacro(tokenArray) {
    let macro = new Macro(tokenArray);
    macroMap.set(macro.name, macro);
    macroTable.push(macro);
  }

  processInline(tokenArray) {
    let tokenIndex = 0;
    let token = tokenArray[tokenIndex];
    let newGlobalTokens = [];
    let newDataTokens = [];
    let globalName = null;
    let address = null;
    let fileName = null;

    if (token.type === 'name') {
      globalName = token.value;
      token = tokenArray[++tokenIndex];
    }

    if (token.type === 'int_literal' ||
      token.type === 'hex_literal' ||
      token.type === 'bin_literal') {
      address = token.value;
      token = tokenArray[++tokenIndex];
    }

    if (token.type !== 'string_literal') {
      logError(`expected to find a file name`, token);
      return;
    }

    fileName = token.value;
    this.preprocessFunc = null;

    token = tokenArray[++tokenIndex] || {};
    if (token.type === 'lp') {
      // is the next token !process
      let processToken = tokenArray[++tokenIndex] || {};
      let fileNameToken = tokenArray[++tokenIndex] || {};
      if (processToken.text === '!process' &&
        fileNameToken.type === 'string_literal') {
        console.log(`dir: ${__dirname}`);
        if (fileNameToken.value.substring(0, 2) === './') {
          this.preprocessFunc = require(`${process.cwd()}/${fileNameToken.value.slice(2)}`);
        }
        else {
          this.preprocessFunc = require(`${__dirname}/preprocess/${fileNameToken.value}`);
        }
      }

    }



    token = tokenArray[0];

    if (globalName != null && address != null) {
      newGlobalTokens.push(
        {
          type: 'lp',
          value: '(',
          text: '(',
          index: token.index,
          line: token.line,
          col: token.col,
          endTokenOffset: 8,
        },
        {
          type: 'module_definitions',
          value: 'global',
          text: 'global',
          index: token.index,
          line: token.line,
          col: token.col,
        },
        {
          type: 'name',
          value: globalName,
          text: globalName,
          index: token.index,
          line: token.line,
          col: token.col,
        },
        {
          type: 'valtype',
          value: binaryen.i32,
          text: 'i32',
          index: token.index,
          line: token.line,
          col: token.col,
        },
        {
          type: 'lp',
          value: '(',
          text: '(',
          index: token.index,
          line: token.line,
          col: token.col,
          endTokenOffset: 3,
        },
        {
          type: 'terminal',
          value: 'i32.const',
          text: 'i32.const',
          index: token.index,
          line: token.line,
          col: token.col,
        },
        {
          type: 'int_literal',
          value: address,
          text: address.toString(),
          index: token.index,
          line: token.line,
          col: token.col,
        },
        {
          type: 'rp',
          value: ')',
          text: ')',
          index: token.index,
          line: token.line,
          col: token.col,
        },
        {
          type: 'rp',
          value: ')',
          text: ')',
          index: token.index,
          line: token.line,
          col: token.col,
        },
        {
          type: 'meta',
          value: 'meta',
          text: 'meta',
          file: this.fileName
        });
      main.module.globalExpressionTokens.push(newGlobalTokens);
      //console.log(main.module.globalExpressionTokens)
    }

    if (address === null) {
      logError(`!inline requires an address`, token);
      return;
    }

    let data = new Buffer.from(fs.readFileSync(fileName, { encoding: "binary" }));

    console.log(`typeof data: ${typeof data}`);
    if (this.preprocessFunc != null) {
      data = this.preprocessFunc(data);
    }

    let dataString = '';

    for (let i = 0; i < data.length; i++) {
      dataString += '\\' + data[i].toString(16).padStart(2, '0');
    }

    newDataTokens.push(
      {
        type: 'lp',
        value: '(',
        text: '(',
        index: token.index,
        line: token.line,
        col: token.col,
        endTokenOffset: 7,
      },
      {
        type: 'module_definitions',
        value: 'data',
        text: 'data',
        index: token.index,
        line: token.line,
        col: token.col,
      },
      {
        type: 'lp',
        value: '(',
        text: '(',
        index: token.index,
        line: token.line,
        col: token.col,
        endTokenOffset: 3,
      },
      {
        type: 'terminal',
        value: 'i32.const',
        text: 'i32.const',
        index: token.index,
        line: token.line,
        col: token.col,
      },
      {
        type: 'int_literal',
        value: address,
        text: address.toString(),
        index: token.index,
        line: token.line,
        col: token.col,
      },
      {
        type: 'rp',
        value: ')',
        text: ')',
        index: token.index,
        line: token.line,
        col: token.col,
      },
      {
        type: 'string_literal',
        value: dataString,
        text: `"${dataString}"`,
        index: token.index,
        line: token.line,
        col: token.col,
      },
      {
        type: 'rp',
        value: ')',
        text: ')',
        index: token.index,
        line: token.line,
        col: token.col,
      },
      {
        type: 'meta',
        value: 'meta',
        text: 'meta',
        file: this.fileName
      });

    main.module.dataExpressionTokens.push(newDataTokens);
  }
}

class Module {
  constructor(tokenizer, fileName) {
    let moduleExists = moduleMap.get(fileName);
    if (moduleExists) {
      logError(`module has already been imported for ${fileName}`, this.tokenArray[0]);
      return;
    }

    this.funcExpressionTokens = [];
    this.tableExpressionTokens = [];
    this.memoryExpressionTokens = [];
    this.globalExpressionTokens = [];
    this.elemExpressionTokens = [];
    this.dataExpressionTokens = [];
    this.startExpressionTokens = [];
    this.importExpressionTokens = [];
    this.exportExpressionTokens = [];

    this.fileName = fileName;

    if (main.module == null) {
      main.module = this;
      main.fileName = fileName;
    }

    this.preprocessor = new Preprocess(tokenizer, fileName);
    this.tokenArray = this.preprocessor.tokens;
    this.unprocessedTokens = tokenizer.tokenArray;

    importedModules.push(this);
    moduleMap.set(fileName, this);

    for (let i = 0; i < this.tokenArray.length; i++) {
      let token = this.tokenArray[i];
      let nextToken = this.tokenArray[i + 1];

      if (token.level === 2 && token.type === 'lp') {
        let endTokenIndex = i + token.endTokenOffset;
        switch (nextToken.text) {
          case "func":
            this.funcExpressionTokens.push(
              this.tokenArray.slice(i, endTokenIndex).concat({
                type: 'meta',
                value: 'meta',
                text: 'meta',
                file: this.fileName
              })
            );
            break;
          case "table":
            this.tableExpressionTokens.push(
              this.tokenArray.slice(i, endTokenIndex).concat({
                type: 'meta',
                value: 'meta',
                text: 'meta',
                file: this.fileName
              })
            );
            break;
          case "memory":
            this.memoryExpressionTokens.push(
              this.tokenArray.slice(i, endTokenIndex).concat({
                type: 'meta',
                value: 'meta',
                text: 'meta',
                file: this.fileName
              })
            );
            break;
          case "global":
            this.globalExpressionTokens.push(
              this.tokenArray.slice(i, endTokenIndex).concat({
                type: 'meta',
                value: 'meta',
                text: 'meta',
                file: this.fileName
              }));
            break;
          case "elem":
            this.elemExpressionTokens.push(
              this.tokenArray.slice(i, endTokenIndex).concat({
                type: 'meta',
                value: 'meta',
                text: 'meta',
                file: this.fileName
              })
            );
            break;
          case "data":
            this.dataExpressionTokens.push(
              this.tokenArray.slice(i, endTokenIndex).concat({
                type: 'meta',
                value: 'meta',
                text: 'meta',
                file: this.fileName
              })
            );
            break;
          case "start":
            if (this.startExpressionTokens.length !== 0) {
              logError('start is defined more than once', this.startExpressionTokens[0]);
              return;
            }
            this.startExpressionTokens = this.tokenArray.slice(i + 1, endTokenIndex);
            break;
          case "import":
            this.importExpressionTokens.push(
              this.tokenArray.slice(i, endTokenIndex).concat({
                type: 'meta',
                value: 'meta',
                text: 'meta',
                file: this.fileName
              })
            );
            break;
          case "export":
            this.exportExpressionTokens.push(
              this.tokenArray.slice(i, endTokenIndex).concat({
                type: 'meta',
                value: 'meta',
                text: 'meta',
                file: this.fileName
              })
            );
            break;
          default:
          //console.log(nextToken.text);
        }
      }
    }
  }

  toString() {
    let tokenMap = row => {
      return row.map(
        token => {
          return token.type !== 'string_literal' ? token.text : token.value;
        }
      );
    };


    return `
    funcExpressionTokens: ${JSON.stringify(this.funcExpressionTokens.map(tokenMap), null, 2)}
    tableExpressionTokens: ${JSON.stringify(this.tableExpressionTokens.map(tokenMap), null, 2)}
    memoryExpressionTokens: ${JSON.stringify(this.memoryExpressionTokens.map(tokenMap), null, 2)}
    globalExpressionTokens: ${JSON.stringify(this.globalExpressionTokens.map(tokenMap), null, 2)}
    elemExpressionTokens: ${JSON.stringify(this.elemExpressionTokens.map(tokenMap), null, 2)}
    dataExpressionTokens: ${JSON.stringify(this.dataExpressionTokens.map(tokenMap), null, 2)}
    startExpressionTokens: ${JSON.stringify(this.startExpressionTokens.map(tokenMap), null, 2)}
    importExpressionTokens: ${JSON.stringify(this.importExpressionTokens.map(tokenMap), null, 2)}
    exportExpressionTokens: ${JSON.stringify(this.exportExpressionTokens.map(tokenMap), null, 2)}
    `;

  }
}

module.exports.Module = Module;
