const { constMap, valtypeMap, logError, binaryen, funcSymbolTable,
  funcSymbolMap, unaryMap, WasmModule, globalSymbolTable, globalSymbolMap, TokenArray } = require('./shared');

var blockCounter = 0;

const PARSE_STATE = {
  START: 0,
  PARAM: 1,
  RESULT: 2,
  LOCAL: 3,
  BODY: 4
}

class SymbolTableEntry {
  constructor(index, id, type) {
    this.index = index;
    this.id = id;
    this.type = type;
  }
}

class StackEntry {
  constructor(expression, type) {
    this.type = type;
    this.expression = expression;
  }
}

class Func {
  constructor(tokenArray) {
    this.parseState = PARSE_STATE.START;
    this.name = `$func_${funcSymbolTable.length}`;
    this.exportName = null;
    this.params = [];
    this.result = binaryen.none;
    this.locals = [];
    this.localMap = new Map();
    this.body = [];
    this.bodyStack = [];
    let startToken = tokenArray[0];
    let bodyStart = startToken.bodyStart - startToken.index;

    for (let i = 0; i < bodyStart; i++) {
      let token = tokenArray[i];

      if (token.type === 'lp') {
        this.subExpression(tokenArray.slice(i + 1, token.endTokenOffset + i));
        i += token.endTokenOffset;
      }
      else if (token.type === 'name') {
        this.name = token.text;
      }
    }

    funcSymbolTable.push(this);
    funcSymbolMap.set(this.name, this);

    // if I want to be able to call functions that are not declared yet I will need
    // to wait to parse the body until after all functions defined in the funcSymbolTable
    this.parseBody(tokenArray.slice(bodyStart));
    if (this.bodyStack.length > 0) {
      this.body.push(this.bodyStack.pop());
    }
    WasmModule.addFunction(this.name,
      binaryen.createType(this.params.map(s => s.type)),
      this.result,
      this.locals.map(s => s.type),
      WasmModule.block(null, this.body.map(se => se.expression), this.result)
    );
  }

  static getFuncSymbol(idToken) {
    if (idToken.type === 'name') {
      return funcSymbolMap.get(idToken.value);
    }
    else if (idToken.type === 'int_literal') {
      return funcSymbolTable[idToken.value];
    }
    return null;
  }

  getLocal(index) {
    if (index >= this.params.length) {
      return this.locals[index - this.params.length];
    }
    return this.params[index];
  }

  subExpression(tokenArray) {
    if (tokenArray.length < 2) {
      logError(`invalid function subexpression`, tokenArray[0]);
      return;
    }
    let token = tokenArray[0];
    let nextToken = tokenArray[1];

    if (token.text === 'type' && this.parseState === PARSE_STATE.START) {
      if (nextToken.type !== 'name') {
        logError(`type must be followed by a type name`, nextToken);
        return;
      }
      logError(`Tell @battagline to implement types`, token);
      return;
    }
    else if (token.text === 'export' && this.parseState === PARSE_STATE.START) {
      if (nextToken.type !== 'string_literal') {
        logError(`unexpected ${nextToken.text} following export`, nextToken);
        return;
      }
      this.exportName = nextToken.value;
      return;
    }
    else if (token.text === 'param') {
      if (this.parseState > PARSE_STATE.PARAM) {
        logError(`param can not be defined here`, token);
        return;
      }

      this.parseState = PARSE_STATE.PARAM;
      let name = `$param_${this.params.length}`;
      let type = binaryen.i32;

      if (nextToken.type === 'name') {
        name = nextToken.text;
        if (tokenArray.length < 3 || tokenArray[2].type !== 'valtype') {
          logError(`param is missing type`, token);
          return;
        }
        type = tokenArray[2].value;
        // this is not right
        let symbol = new SymbolTableEntry(this.params.length, name, type);
        this.params.push(symbol);
        this.localMap.set(name, symbol);
        return;
      }
      else if (nextToken.type === 'valtype') {
        for (let i = 1; i < tokenArray.length; i++) {
          let valToken = tokenArray[i];
          if (valToken.type !== 'valtype') {
            logError(`keyword is not a Wasm type ${valToken.text}`, valToken);
            return;
          }
          name = `$param_${this.params.length}`;
          type = valToken.value;
          let symbol = new SymbolTableEntry(this.params.length, name, type);
          this.params.push(symbol);
          this.localMap.set(name, symbol);
        }
      }
      else {
        logError(`unexpected ${nextToken.text} following param`, nextToken);
        return;
      }
    }
    else if (token.text === 'result') {
      if (this.parseState >= PARSE_STATE.RESULT) {
        logError(`result definition can not be here`, token);
        return;
      }
      this.parseState = PARSE_STATE.RESULT;
      if (nextToken.type !== 'valtype') {
        logError(`unexpected ${nextToken.text} following result`, nextToken);
        return;
      }

      this.result = nextToken.value;
      return;
    }
    // the state check should probably be inside the if
    else if (token.text === 'local') {
      if (this.parseState > PARSE_STATE.LOCAL) {
        logError(`local can not be defined here`, token);
        return;
      }

      this.parseState = PARSE_STATE.LOCAL;
      let name = `$local_${this.locals.length + this.params.length}`;
      let type = binaryen.i32;

      if (nextToken.type === 'name') {
        name = nextToken.text;
        if (tokenArray.length < 3 || tokenArray[2].type !== 'valtype') {
          logError(`local is missing type`, token);
          return;
        }
        type = tokenArray[2].value;
        let symbol = new SymbolTableEntry(this.params.length + this.locals.length, name, type);
        this.locals.push(symbol);
        this.localMap.set(name, symbol);
        return;
      }
      else if (nextToken.type === 'valtype') {
        for (let i = 1; i < tokenArray.length; i++) {
          let valToken = tokenArray[i];
          if (valToken.type !== 'valtype') {
            logError(`keyword is not a Wasm type ${valToken.text}`, valToken);
            return;
          }
          let name = `$local_${this.locals.length + this.params.length}`;
          type = valToken.value;
          let symbol = new SymbolTableEntry(this.params.length + this.locals.length, name, type);
          this.locals.push(symbol);
          this.localMap.set(name, symbol);
        }
      }
      else {
        logError(`unexpected ${nextToken.text} following local`, nextToken);
        return;
      }
    }
  }

  terminal(token, nextToken = null) {
    if (nextToken === null) {
      if (token.text === 'nop') {
        return new StackEntry(WasmModule.nop(), binaryen.none);
      }
      else if (token.text === 'unreachable') {
        return new StackEntry(WasmModule.unreachable(), binaryen.none);
      }
    }
    else if (token.text.slice(-5) === 'const') {
      let constFunc = constMap.get(token.text);
      // hival should be 0 unless this is an 
      return new StackEntry(constFunc(nextToken.value, nextToken.hival || 0),
        valtypeMap.get(token.text.slice(0, 3)));
    }
    else if (token.text === 'local.get') {
      let index = 0;
      let localSymbol = null;
      if (nextToken.type === 'int_literal') {
        index = nextToken.value;
        localSymbol.getLocal(index);
      }
      else if (nextToken.type === 'name') {
        localSymbol = this.localMap.get(nextToken.text);
        index = localSymbol.index;
      }
      else {
        logError(`local.get must be followed by an integer or name, not ${nextToken.text}`, nextToken);
        return null;
      }
      return new StackEntry(WasmModule.local.get(index, localSymbol.type), localSymbol.type);
    }
    else if (token.text === 'global.get') {
      let globalSymbol = null;
      if (nextToken.type === 'int_literal') {
        globalSymbol = globalSymbolTable[nextToken.value];
      }
      else if (nextToken.type === 'name') {
        globalSymbol = globalSymbolMap.get(nextToken.text);
      }
      else {
        logError(`global.get must be followed by an integer or name, not ${nextToken.text}`, nextToken);
        return null;
      }
      return new StackEntry(WasmModule.global.get(globalSymbol.id, globalSymbol.globalType),
        globalSymbol.globalType);
    }
    logError(`unknown keyword`, token);
    return null;
  }

  ifBranch(tokenArray) {
    let condition = null;
    let endConditionTokenOffset = null;
    if (tokenArray[1].type === 'lp') {
      if (tokenArray[2].text === 'then') {
        logError(`missing condition branch after '(if'`, tokenArray[2]);
        return null;
      }
      endConditionTokenOffset = tokenArray[1].endTokenOffset;
      condition = this.bodyBranch(tokenArray.slice(2, 1 + endConditionTokenOffset));
    }
    else {
      logError(`this style of branch requires a condition`, tokenArray[1]);
      return null;
    }

    let thenStartIndex = (endConditionTokenOffset || 0) + 2;
    if (tokenArray[thenStartIndex].type !== 'lp') {
      logError(`expeted to find '(' instead found ${tokenArray[thenStartIndex].text}`,
        tokenArray[thenStartIndex]);
      return null;
    }

    if (tokenArray[thenStartIndex + 1].text !== 'then') {
      logError(`expeted to find 'then' instead found ${tokenArray[thenStartIndex].text}`,
        tokenArray[thenStartIndex]);
      return null;
    }

    let thenStack = [];
    let thenBlock = [];

    let endThenIndex = thenStartIndex + tokenArray[thenStartIndex].endTokenOffset;
    this.bodyBlock(tokenArray.slice(thenStartIndex + 2, endThenIndex), thenBlock, thenStack);

    let hasElse = false;
    let elseStartIndex = endThenIndex + 1;
    let elseStack = [];
    let elseBlock = [];

    if (tokenArray[elseStartIndex].type === 'lp' &&
      tokenArray[elseStartIndex + 1].text === 'else') {
      hasElse = true;
      let endElseIndex = tokenArray[elseStartIndex].endTokenOffset + elseStartIndex;
      this.bodyBlock(tokenArray.slice(elseStartIndex + 2, endElseIndex), elseBlock, elseStack);
    }

    // Module#if(condition: ExpressionRef, ifTrue: ExpressionRef, ifFalse?: ExpressionRef)
    // Module#block(label: string | null, children: ExpressionRef[], resultType?: Type): ExpressionRef
    let blockResult = thenStack[0] || { type: binaryen.none };
    if (blockResult.type !== binaryen.none) {
      thenBlock.push(thenStack.pop());
    }
    let thenWasmBlock = WasmModule.block(null, thenBlock.map(entry => entry.expression), blockResult.type)

    if (hasElse === false) {
      return new StackEntry(
        WasmModule.if(condition.expression, thenWasmBlock),
        blockResult.type);
    }
    else {
      if (blockResult.type !== binaryen.none) {
        elseBlock.push(elseStack.pop());
      }
      let elseWasmBlock = WasmModule.block(null, elseBlock.map(entry => entry.expression), blockResult.type);

      return new StackEntry(
        WasmModule.if(condition.expression, thenWasmBlock, elseWasmBlock),
        blockResult.type);
    }
  }

  // condition is a StackEntry
  // I DON'T HAVE NEARLY ENOUGH ERROR CHECKING HERE
  ifBlock(tokenArray, condition) {
    let ifToken = tokenArray[0];
    let endToken = tokenArray[ifToken.endTokenOffset];
    let elseToken = null;

    let thenStack = [];
    let thenBlock = [];

    let elseStack = [];
    let elseBlock = [];

    if (endToken != null && endToken.type === 'else_block') {
      let elseTokenIndex = ifToken.endTokenOffset; //endToken;
      let endTokenIndex = elseTokenIndex + tokenArray[elseTokenIndex].endTokenOffset;
      this.bodyBlock(tokenArray.slice(1, elseTokenIndex), thenBlock, thenStack);
      this.bodyBlock(tokenArray.slice(elseTokenIndex + 1, endTokenIndex), elseBlock, elseStack);

      let blockResult = thenStack[0] || { type: binaryen.none };
      if (blockResult.type !== binaryen.none) {
        thenBlock.push(thenStack.pop());

        if (elseStack.length === 0) {
          logError(`else must end with a typed value on the stack`, elseToken);
          return;
        }
        elseBlock.push(elseStack.pop()); // will need to make sure there are items on the else stack
      }
      let thenWasmBlock = WasmModule.block(null, thenBlock.map(entry => entry.expression), blockResult.type)
      let elseWasmBlock = WasmModule.block(null, elseBlock.map(entry => entry.expression), blockResult.type)

      return new StackEntry(
        WasmModule.if(condition.expression, thenWasmBlock, elseWasmBlock),
        blockResult.type);
    }
    else {
      this.bodyBlock(tokenArray.slice(1, ifToken.endTokenOffset), thenBlock, thenStack);
      let blockResult = thenStack[0] || { type: binaryen.none };
      if (blockResult.type !== binaryen.none) {
        thenBlock.push(thenStack.pop());
      }
      let thenWasmBlock = WasmModule.block(null, thenBlock.map(entry => entry.expression), blockResult.type)
      // I DON' TTHINK THIS IS RIGHT
      return new StackEntry(
        WasmModule.if(condition.expression, thenWasmBlock),
        blockResult.type);

    }

  }

  bodyBranch(tokenArray) {
    let startToken = tokenArray[0];
    let nextToken = tokenArray[1];

    if (startToken.type === 'unary') {
      let unaryDef = unaryMap.get(startToken.text);
      let unaryFunc = unaryDef.binaryenFunc;
      let unaryResult = unaryDef.resultType;
      if (nextToken.type !== 'lp') {
        logError(`expected to see '(' instead of '${nextToken.text}'`)
        return null;
      }
      let sub = this.bodyBranch(tokenArray.slice(2, -1));
      if (sub == null || sub.type !== unaryDef.paramType) {
        logError(`${startToken.text} is not receiving the proper input type`, startToken);
        return null;
      }
      return new StackEntry(unaryFunc(sub.expression), unaryResult);
    }
    else if (startToken.type === 'binary') {
      let binaryDef = binaryMap.get(startToken.text);
      let binaryFunc = binaryDef.binaryenFunc;
      let binaryResult = binaryDef.resultType;

      if (nextToken.type !== 'lp') {
        logError(`expected to see '(' instead of '${nextToken.text}'`);
        return null;
      }

      let secondParamIndex = nextToken.endTokenOffset + 2;
      let secondParamToken = tokenArray[secondParamIndex];

      if (secondParamToken.type !== 'lp') {
        logError(`expected to see '(' instead of '${secondParamToken.text}'`);
        return null;
      }

      let paramSub1 = this.bodyBranch(tokenArray.slice(2, nextToken.endTokenOffset));
      if (paramSub1 == null || paramSub1.type != binaryDef.paramType1) {
        logError(`${startToken.text} is not receiving the proper input type`, startToken);
        return null;
      }

      let paramSub2 = this.bodyBranch(tokenArray.slice(secondParamIndex, -1));
      if (paramSub2 == null || paramSub2.type != binaryDef.paramType2) {
        logError(`${startToken.text} is not receiving the proper input type`, startToken);
        return null;
      }
      return new StackEntry(binaryFunc(paramSub1.expression, paramSub2.expression), binaryResult);
    }
    else if (startToken.type === 'call') {
      if (nextToken.type !== 'name' &&
        nextToken.type !== 'int_literal') {
        logError(`call must be followed by a name or integer, not ${nextToken.text}`,
          nextToken);
        return;
      }
      // I NEED TO STEP THROUGH THIS
      let func = Func.getFuncSymbol(nextToken);
      let paramCount = func.params.length;
      let paramIndex = 2;
      let callParams = [];

      for (let pi = 0; pi < paramCount; pi++) {
        let paramTok = tokenArray[paramIndex];
        if (paramTok.type !== 'lp') {
          logError(`expected to see '(' instead of '${nextToken.text}'`);
          return null;
        }
        let end = paramIndex + paramTok.endTokenOffset;
        callParams.push(this.bodyBranch(tokenArray.slice(paramIndex + 1, end)));
        paramIndex = end + 1;
      }

      return new StackEntry(
        WasmModule.call(func.name, callParams.map(se => se.expression), func.result),
        func.result
      );

    }
    else if (startToken.type === 'terminal') {
      if (startToken.text === 'nop' || startToken.text === 'unreachable') {
        return this.terminal(startToken);
      }
      else {
        return this.terminal(startToken, nextToken);
      }

    }
    else if (startToken.text === 'if') {
      return this.ifBranch(tokenArray);
    }

  }

  bodyBlock(tokenArray, blockTokens = null, blockStack = null) {
    let block = blockTokens || this.body;
    let stack = blockStack || this.bodyStack;

    for (let i = 0; i < tokenArray.length; i++) {
      let token = tokenArray[i];
      let nextToken = tokenArray[i + 1];
      let nextEntry = null;

      if (token.type === 'lp') {
        nextEntry = this.bodyBranch(tokenArray.slice(i + 1, i + token.endTokenOffset));
        if (nextEntry.type === binaryen.none) {
          block.push(nextEntry);
        }
        else {
          stack.push(nextEntry);
        }
        i += token.endTokenOffset;
      }
      else if (token.type === 'terminal') {
        if (token.text === 'nop' || token.text === 'unreachable') {
          // THINK ABOUT WHERE PUSHING INTO THE BODY COULD GO WRONG
          block.push(this.terminal(token));
        }
        else {
          // I NEED TO THINK ABOUT THE WAY I'M USING BODYSTACK HERE
          stack.push(this.terminal(token, nextToken));
          i++;
        }
      }
      else if (token.type === 'unary') {
        let unaryDef = unaryMap.get(token.text);
        let unaryFunc = unaryDef.binaryenFunc;
        let unaryResult = unaryDef.resultType;

        let stackEntry = new StackEntry(unaryFunc(stack.pop().expression), unaryResult);
        if (stackEntry.type === binaryen.none) {
          block.push(stackEntry);
        }
        else {
          stack.push(stackEntry);
        }
      }
      else if (token.type === 'binary') {
        let binaryDef = binaryMap.get(startToken.text);
        let binaryFunc = binaryDef.binaryenFunc;
        let binaryResult = binaryDef.resultType;

        if (stack.length < 2) {
          logError(`this function requires at least two parameters on the stack`, token);
        }

        let paramSub1 = stack.pop();
        let paramSub2 = stack.pop();
        if (paramSub1.type != binaryDef.paramType1 || paramSub2.type != binaryDef.paramType2) {
          logError(`${token.text} is not receiving the proper input type`, token);
          return null;
        }

        let stackEntry = new StackEntry(binaryFunc(paramSub1.expression, paramSub2.expression),
          binaryResult);
        if (stackEntry.type === binaryen.none) {
          block.push(stackEntry);
        }
        else {
          stack.push(stackEntry);
        }
      }
      else if (token.type === 'call') {
        if (nextToken.type !== 'name' &&
          nextToken.type !== 'int_literal') {
          logError(`call must be followed by a name or integer, not ${nextToken.text}`,
            nextToken);
          return;
        }
        // I NEED TO STEP THROUGH THIS
        let func = Func.getFuncSymbol(nextToken);
        let paramCount = func.params.length;
        let callParams = [];

        for (let pi = 0; pi < paramCount; pi++) {
          let paramTok = stack.pop();
          callParams.unshift(paramTok);
        }

        let stackEntry = new StackEntry(
          WasmModule.call(func.name, callParams.map(se => se.expression), func.result),
          func.result
        );
        if (stackEntry.type === binaryen.none) {
          block.push(stackEntry);
        }
        else {
          stack.push(stackEntry);
        }

      }
      else if (token.type === 'begin_block') {
        if (token.text === 'if') {
          let endIndex = i + token.endTokenOffset;
          if (tokenArray[endIndex].type === 'else_block') {
            endIndex += tokenArray[endIndex].endTokenOffset;
          }
          endIndex++;
          let ifStackEntry = this.ifBlock(tokenArray.slice(i, endIndex), stack.pop());
          if (ifStackEntry.type === binaryen.none) {
            block.push(ifStackEntry);
          }
          else {
            stack.push(ifStackEntry);
          }
          i += endIndex;
        }
        else {
          // this will be for loop and block when I get to it
          logError(`Rick hasn't added loops and blocks yet.  Please tell @battagline`, token);
          return;
        }
      }
    }

  }

  parseBody(tokenArray) {
    this.bodyBlock(tokenArray);
  }
}

module.exports.Func = Func;