class Module {
  constructor(tokenArray) {
    this.funcExpressionTokens = [];
    this.tableExpressionTokens = [];
    this.memoryExpressionTokens = [];
    this.globalExpressionTokens = [];
    this.elemExpressionTokens = [];
    this.dataExpressionTokens = [];
    this.startExpressionTokens = [];
    this.importExpressionTokens = [];
    this.exportExpressionTokens = [];

    for (let i = 0; i < tokenArray.length; i++) {
      let token = tokenArray[i];
      let nextToken = tokenArray[i + 1];

      if (token.level === 2 && token.type === 'lp') {
        let endTokenIndex = token.endTokenIndex;
        switch (nextToken.text) {
          case "func":
            this.funcExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
            break;
          case "table":
            this.tableExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
            break;
          case "memory":
            this.memoryExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
            break;
          case "global":
            this.globalExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
            break;
          case "elem":
            this.elemExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
            break;
          case "data":
            this.dataExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
            break;
          case "start":
            this.startExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
            break;
          case "import":
            this.importExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
            break;
          case "export":
            this.exportExpressionTokens.push(tokenArray.slice(i, endTokenIndex));
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
