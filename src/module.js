const { logError, moduleStack, importedModules, moduleMap, main } = require("./shared");
const { Tokenizer } = require("./tokenizer");
const fs = require('fs');

class Preprocess {
  constructor(tokenizer) {
    let tokenArray = tokenizer.tokenArray;
    let processedTokens = [];
    let processedIndex = 0;
    this.importedModules = [];

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
            this.processImport(tokenArray.slice(i + 1, i + prevToken.endTokenOffset), processedTokens);
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
            this.processInline(tokenArray.slice(i + 1, i + prevToken.endTokenOffset), processedTokens);
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

  processImport(tokenArray, processedTokens) {
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
        console.log(`FILE: ${file_name}`);
        var bytes = fs.readFileSync(file_name);
        var code = bytes.toString();

        let importTokens = [];
        let tokenizer = new Tokenizer(code, importTokens)
        // not sure what to do with importTokens

        let module = new Module(tokenizer, file_name);
        this.importedModules.push(module);

        if (main.module.fileName !== module.fileName) {
          module.funcExpressionTokens.forEach(exp => main.module.funcExpressionTokens.push(exp));
          module.globalExpressionTokens.forEach(exp => main.module.globalExpressionTokens.push(exp));
          module.importExpressionTokens.forEach(exp => main.module.importExpressionTokens.push(exp));

          // how to tie data expressions to memory, how to tie memory to file
          module.memoryExpressionTokens.forEach(exp => main.module.memoryExpressionTokens.push(exp));
          module.dataExpressionTokens.forEach(exp => main.module.dataExpressionTokens.push(exp));

        }

        /*
        this.tableExpressionTokens = [];
        this.elemExpressionTokens = [];
        this.startExpressionTokens = [];
        this.exportExpressionTokens = [];
        */
      }

    }
  }

  processMacro(tokenArray, processedTokens) {

  }

  processInline(tokenArray, processedTokens) {

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
    }

    this.preprocessor = new Preprocess(tokenizer);
    this.tokenArray = this.preprocessor.tokens;
    this.unprocessedTokens = tokenizer.tokenArray;

    importedModules.push(this);
    moduleMap.set(fileName, this);

    for (let i = 0; i < this.tokenArray.length; i++) {
      let token = this.tokenArray[i];
      let nextToken = this.tokenArray[i + 1];

      if (token.level === 2 && token.type === 'lp') {
        let endTokenIndex = token.endTokenIndex;
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
            console.log(nextToken.text);
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
