const { WasmModule, binaryen, logError, TokenArray, globalSymbolTable, globalSymbolMap, functionTable } = require('./shared.js')
const { binaryenTerminalMap, binaryenUnaryMap, binaryenBinaryMap } = require('./binaryenMaps.js');
// DO I WANT TO CALL THIS A BRANCH OR AN EXPRESSION
// STARTING_TOKEN, KEYWORD, IDENTIFIER, TYPE

var index;
var parseTree = {};
module.exports.parseTree = parseTree;

function lookAheadRP(start_index, level) {
  for (let i = start_index; i < TokenArray.length; i++) {
    if (TokenArray[i].type === 'rp' && TokenArray[i].level === level) {
      return i;
    }
  }
}


function lookAheadLP(start_index) {
  for (let i = start_index; i < TokenArray.length; i++) {
    if (TokenArray[i].type === 'lp') {
      return i;
    }
  }
}

function lookAheadSig(start_index, end_index) {
  for (let i = start_index; i < end_index; i++) {
    if (TokenArray[i].type === 'sig') {
      return i;
    }
  }
  return -1;
}

function binaryenExpFromBinary(binary_index, param1_token, param2_token) {
  let token = TokenArray[binary_index];
  let text = token.text;
  let bf = binaryenBinaryMap.get(text);

  if (param1_token == null || param2_token == null) {
    logError(`${text} expression requires two parameters`, token);
    return;
  }

  token.children.push(param1_token);
  token.children.push(param2_token);
  token.expression = bf(param1_token.expression, param2_token.expression);
  return token;
}

function binaryenFromLocalSet(set_index, param_token, func_branch) {
  let token = TokenArray[set_index];
  let nextToken = TokenArray[set_index + 1];
  let text = token.text;
  let local = null;

  if (param_token == null) {
    logError(`${text} expression requires one parameter`, token);
    return;
  }

  if (nextToken.type === 'name') {
    local = func_branch.localMap.get(nextToken.text);
    token.attributes.push(nextToken);
  }
  else if (nextToken.type === 'int_literal') {
    let index = nextToken.value;
    if (index < func_branch.params.length) {
      local = func_branch.params[index];
    }
    else {
      local = func_branch.locals[index - func_branch.params.length];
    }
    token.attributes.push(nextToken);

  }
  else {
    logError(`${text} must be followed by a name or an integer literal`, nextToken);
    return;
  }

  token.children.push(param_token);
  token.expression = WasmModule.local.set(local.varIndex, param_token.expression);
  console.log('===================SET LOCAL=====================')
  console.log('token:');
  console.log(token);
  console.log('param_token:');
  console.log(param_token);
  console.log('==================================================')
  //  token.expression = bf(param_token.expression);
  return token;

}

function binaryenFromGlobalSet(set_index, param_token, func_branch) {
  let token = TokenArray[set_index];
  let nextToken = TokenArray[set_index + 1];
  let text = token.text;
  let global = null;

  if (param_token == null) {
    logError(`${text} expression requires one parameter`, token);
    return;
  }

  if (nextToken.type === 'name') {
    global = globalSymbolMap.get(nextToken.text);
    token.attributes.push(nextToken);
  }
  else if (nextToken.type === 'int_literal') {
    let index = nextToken.value;
    global = globalSymbolTable[index];
    token.attributes.push(nextToken);

  }
  else {
    logError(`${text} must be followed by a name or an integer literal`, nextToken);
    return;
  }

  token.children.push(param_token);
  token.expression = WasmModule.global.set(local.varIndex, param_token.expression);
  console.log('===================SET LOCAL=====================')
  console.log(token);
  console.log('==================================================')
  //  token.expression = bf(param_token.expression);
  return token;

}

function binaryenExpFromUnary(unary_index, param_token) {
  let token = TokenArray[unary_index];
  let text = token.text;
  let bf = binaryenUnaryMap.get(text);

  if (param_token == null) {
    logError(`${text} expression requires one parameter`, token);
    return;
  }

  token.children.push(param_token);
  token.expression = bf(param_token.expression);
  return token;
}

function binaryenExpFromTerminal(terminal_index, func_branch) {
  let token = TokenArray[terminal_index];
  let text = token.text;
  let textEnd = text.slice(text.length - 5);
  let bf = binaryenTerminalMap.get(text);

  if (text === 'local.get') {
    let nextToken = TokenArray[terminal_index + 1];
    let local = null;

    if (nextToken.type === 'name') {
      local = func_branch.localMap.get(nextToken.text);
      token.attributes.push(nextToken);

      token.result = local.btype;
      token.expression = bf(local.varIndex, local.btype);
    }
    else if (nextToken.type === 'int_literal') {
      let index = nextToken.value;
      if (index < func_branch.params.length) {
        local = func_branch.params[index];
      }
      else {
        local = func_branch.locals[index - func_branch.params.length];
      }
      token.result = local.btype;
      token.attributes.push(nextToken);
      token.expression = bf(local.varIndex, local.btype);
    }
    else {
      logError(`${text} must be followed by a name or an integer literal`, nextToken);
      return;
    }
  }
  else if (text === 'global.get') {
    let nextToken = TokenArray[terminal_index + 1];
    let global = null;
    if (nextToken.type === 'name') {
      global = globalSymbolMap.get(nextToken.text);
      token.attributes.push(nextToken);

      token.result = global.btype;
      token.expression = bf(global.name, global.btype);
    }
    else if (nextToken.type === 'int_literal') {
      let index = nextToken.value;
      global = globalSymbolTable[index];
      token.attributes.push(nextToken);

      token.result = global.btype;
      token.expression = bf(global.name, global.btype);
    }
    else {
      logError(`${text} must be followed by a name or an integer literal`, nextToken);
      return;
    }
  }
  else if (textEnd === 'const') {
    let nextToken = TokenArray[terminal_index + 1];
    token.attributes.push(nextToken);
    // the hival token is only needed for i64, but i'm hoping doesn't cause a problem.
    token.expression = bf(nextToken.value, nextToken.hival);
  }
  else {
    logError(`unexpected terminal ${text}`, token);
    return;
  }
  return token;
}

function BuildExpressionBranch(index, func_branch) {
  let bf = null;
  let token = TokenArray[index];
  if (token.type === 'terminal') {
    return binaryenExpFromTerminal(index, func_branch);
  }
  else if (token.type === 'unary') {
    let param_i = lookAheadLP(index) + 1;
    return binaryenExpFromUnary(index, BuildExpressionBranch(param_i, func_branch));
  }
  else if (token.type === 'binary') {
    let param1_i = lookAheadLP(index) + 1;
    let param2_i = lookAheadLP(param1_i) + 1;
    return binaryenExpFromBinary(index,
      BuildExpressionBranch(param1_i, func_branch),
      BuildExpressionBranch(param2_i, func_branch));
  }
  else if (token.type === 'local_set') {
    let param_i = lookAheadLP(index) + 1;
    return binaryenFromLocalSet(index, BuildExpressionBranch(param_i, func_branch), func_branch);
  }
  else if (token.type === 'global_set') {
    let param_i = lookAheadLP(index) + 1;
    return binaryenFromGlobalSet(index, BuildExpressionBranch(param_i, func_branch), func_branch);
  }
  else {
    logError(`${token.text} is not an expression branch`, token);
  }
}

let funcStack = [];

function createFunctionBlock(start_index, func_branch) {
  let endIndex = func_branch.tokenEndIndex;
  for (let i = start_index; i < endIndex; i++) {
    let token = TokenArray[i];
    // this is not right
    // this will change every pass through the loop
    let isExpression = (TokenArray[i - 1].type === 'lp')
    let parentToken = false;

    if (token.type === 'terminal') {
      parentToken = true;
      token = binaryenExpFromTerminal(i, func_branch);
    }
    else if (isExpression) {
      parentToken = true;
      token = BuildExpressionBranch(i, func_branch)
      i = lookAheadRP(i, token.level);
    }
    else {
      if (token.type === 'unary') {
        parentToken = true;
        token = binaryenExpFromUnary(i, funcStack.pop());
      }
      else if (token.type === 'binary') {
        parentToken = true;
        let p2 = funcStack.pop();
        let p1 = funcStack.pop();
        token = binaryenExpFromBinary(i, p1, p2)
      }
      else if (token.type === 'local_set') {
        parentToken = true;
        let nextToken = TokenArray[++i];
        let local = null;
        if (nextToken.type === 'name') {
          local = func_branch.localMap.get(nextToken.text);
        }
        else if (nextToken.type === 'int_literal') {
          let index = nextToken.value;
          if (index < func_branch.params.length) {
            local = func_branch.params[index];
          }
          else {
            local = func_branch.locals[index - func_branch.params.length];
          }
        }
        else {
          logError(`${text} must be followed by a name or an integer literal`, nextToken);
          return;
        }
        token.attributes.push(nextToken);
        let param_token = funcStack.pop();
        token.expression = WasmModule.local.set(local.varIndex, param_token.expression);

      }
      else if (token.type === 'global_set') {
        parentToken = true;
        let nextToken = TokenArray[++i];
        let global = null;
        if (nextToken.type === 'name') {
          global = globalSymbolMap.get(nextToken.text);
        }
        else if (nextToken.type === 'int_literal') {
          let index = nextToken.value;
          global = globalSymbolTable[index];
        }
        else {
          logError(`${text} must be followed by a name or an integer literal`, nextToken);
          return;
        }
        token.attributes.push(nextToken);
        let param_token = funcStack.pop();
        token.expression = WasmModule.global.set(global.name, param_token.expression);
        //func_branch.block.push(token);
      }
    }

    if (parentToken) {
      if (token.result !== binaryen.none) {
        funcStack.push(token);
      }
      else {
        func_branch.block.push(token);
      }
    }
  }

  // at the end of the loop check the function result vs what is left on the stack
  if (funcStack.length > 1) {
    logError("functions can not return more than one value", funcStack[1]);
    return;
  }
  else if (func_branch.result === binaryen.none && funcStack.length > 0) {
    logError("This function should not return a value", funcStack[0]);
    return;
  }
  else {
    //    func_branch.block.push(WasmModule.return(funcStack.pop()));
    func_branch.block.push(funcStack.pop());
  }

  let create_type = binaryen.createType(func_branch.params.map(param => param.btype));
  let block = func_branch.block.map(tok => tok.expression);

  let funcref = WasmModule.addFunction(func_branch.name,
    create_type,
    func_branch.result,
    func_branch.locals.map(local => local.btype),
    WasmModule.block(null, block)
  );

}

function genGlobal(currentToken) {
  let globalBranch = currentToken;
  globalBranch.tokenStartIndex = index;
  globalBranch.tokenEndIndex = lookAheadRP(globalBranch.tokenStartIndex, currentToken.level);
  globalBranch.name = `$global_${globalSymbolTable.length}`;
  globalBranch.exportName = null;
  globalBranch.globalId = globalSymbolTable.length;
  globalBranch.mutable = false;
  globalBranch.btype = binaryen.i32;
  globalBranch.initToken = null;
  globalBranch.ref = null;


  //let searchState = 0;
  //let rp = 0;
  for (let i = globalBranch.tokenStartIndex; i < globalBranch.tokenEndIndex; i++) {
    if (TokenArray[i].type === 'name') {
      globalBranch.name = TokenArray[i].value;
    }
    else if (TokenArray[i].text === 'export') {
      if (TokenArray[++i].type === 'string_literal') {
        globalBranch.exportName = TokenArray[i].value;
      }
      else {
        logError('export keyword must be followed by a string literal', TokenArray[i]);
        return;
      }
    }
    else if (TokenArray[i].type === 'type') {
      globalBranch.btype = TokenArray[i].btype;
    }
    else if (TokenArray[i].text === 'mut') {
      globalBranch.mutable = true;
      if (TokenArray[++i].type === 'type') {
        globalBranch.btype = TokenArray[i].btype;
      }
      else {
        logError('mut keyword must be followed by a type', TokenArray[i]);
        return;
      }
    }
    else if (TokenArray[i].text.slice(TokenArray[i].text.length - 5) === 'const') {
      globalBranch.initToken = binaryenExpFromTerminal(i);
    }

  }
  globalSymbolTable.push(globalBranch);
  globalSymbolMap.set(globalBranch.name, globalBranch);
  parseTree.module.children.push(globalBranch);

  WasmModule.addGlobal(globalBranch.name, globalBranch.btype, globalBranch.mutable, globalBranch.initToken.expression);

  if (globalBranch.exportName != null) {
    WasmModule.addGlobalExport(globalBranch.name, globalBranch.exportName);
  }
}

function genFunc(currentToken) {
  let funcBranch = currentToken;
  funcBranch.tokenStartIndex = index;
  funcBranch.tokenEndIndex = lookAheadRP(funcBranch.tokenStartIndex, currentToken.level);
  funcBranch.name = `$func_${functionTable.length}`;
  funcBranch.exportName = null;
  funcBranch.funcId = functionTable.length;
  funcBranch.params = [];
  funcBranch.result = binaryen.none;
  funcBranch.locals = [];
  funcBranch.localMap = new Map();
  funcBranch.block = [];

  /*
  Parsing function definition with a FSM
  searchState == 0: search for name
  searchState == 1: search for export
  searchState == 2: search for parameters
  searchState == 3: search for result
  searchState == 4: search for locals
  searchState == 5: function body
  */
  let searchState = 0;
  let rp = 0;

  for (let i = funcBranch.tokenStartIndex; i < funcBranch.tokenEndIndex; i++) {
    if (TokenArray[i].type === 'name' && searchState === 0) {
      searchState = 1;
      funcBranch.name = TokenArray[i].value;
    }
    else if (TokenArray[i].value === 'export' && searchState <= 1) {
      searchState = 2;
      if (TokenArray[i + 1].type !== 'string_literal') {
        logError(`export token must be followed by a string literal`, TokenArray[i + 1]);
        return;
      }
      funcBranch.exportName = TokenArray[++i].value;
    }
    else if (TokenArray[i].value === 'param' && searchState <= 2) {
      searchState = 2;
      if (TokenArray[i + 1].type !== 'name' && TokenArray[i + 1].type !== 'type') {
        logError(`param token must be followed by a name or type`, TokenArray[i + 1]);
        return;
      }
      if (TokenArray[i - 1].type !== 'lp') {
        logError(`param token must follow a left paren`, TokenArray[i - 1]);
        return;
      }

      if (TokenArray[i + 1].type === 'name') {
        // this is a name token
        if (TokenArray[i + 2].type !== 'type') {
          logError(`param name must be followed by a type`, TokenArray[i + 2]);
          return;
        }

        TokenArray[i].attributes.push(TokenArray[i + 1]);
        TokenArray[i].attributes.push(TokenArray[i + 2]);

        let param = Object.assign(TokenArray[i], {
          name: TokenArray[i + 1].value,
          result: TokenArray[i + 2].btype,
          btype: TokenArray[i + 2].btype,
          varIndex: funcBranch.params.length
        });

        funcBranch.params.push(param);
        funcBranch.localMap.set(param.name, param);

        i = lookAheadRP(i, TokenArray[i].level);
      }
      else {
        // this is a type token
        rp = lookAheadRP(i, TokenArray[i].level);
        for (let j = i; j < rp; j++) {
          if (TokenArray[j].type !== 'type') {
            logError(`param must be followed by a name or series of types`, TokenArray[j]);
            return;
          }
          TokenArray[i].attributes.push(TokenArray[j]);
          funcBranch.params.push(Object.assign(TokenArray[i],
            {
              name: `$param_${funcBranch.params.length}`,
              result: TokenArray[j].btype,
              varIndex: funcBranch.params.length
            }
          ));
        }
        i = rp;
      }
    }
    else if (TokenArray[i].value === 'result' && searchState <= 3) {
      searchState = 4;
      if (TokenArray[i + 1].type !== 'type') {
        logError(`result token must be followed by a type`, TokenArray[i + 1]);
        return;
      }
      funcBranch.result = TokenArray[++i].btype;
      i = lookAheadRP(i, TokenArray[i].level);
    }
    else if (TokenArray[i].value === 'local' && searchState <= 4) {
      if (TokenArray[i + 1].type !== 'name' && TokenArray[i + 1].type !== 'type') {
        logError(`local token must be followed by a name or type`, TokenArray[i + 1]);
        return;
      }
      if (TokenArray[i - 1].type !== 'lp') {
        logError(`local token must follow a left paren`, TokenArray[i - 1]);
        return;
      }

      if (TokenArray[i + 1].type === 'name') {
        // this is a name token
        if (TokenArray[i + 2].type !== 'type') {
          logError(`local name must be followed by a type`, TokenArray[i + 2]);
          return;
        }

        let local = Object.assign(TokenArray[i], {
          name: TokenArray[i + 1].value,
          btype: TokenArray[i + 2].btype,
          varIndex: (funcBranch.params.length + funcBranch.locals.length)
        });

        funcBranch.locals.push(local);
        funcBranch.localMap.set(local.name, local);

        i = lookAheadRP(i, TokenArray[i].level);

      }
      else {
        // this is a type token
        rp = lookAheadRP(i, TokenArray[i].level);
        for (let j = i; j < rp; j++) {
          if (TokenArray[j].type !== 'type') {
            logError(`local must be followed by a name or series of types`, TokenArray[j]);
            return;
          }
          funcBranch.locals.push(Object.assign(TokenArray[i],
            {
              name: `$local_${funcBranch.locals.length}`,
              btype: TokenArray[j].btype,
              varIndex: (funcBranch.params.length + funcBranch.locals.length)
            }
          ));
        }
        i = rp;
      }
    }
    else if (searchState === 5) {
      //funcBranch.block.push(TokenArray[i]);
      createFunctionBlock(i, funcBranch);
      i = funcBranch.tokenEndIndex;
    }

    if (searchState < 5 && lookAheadSig(i, funcBranch.tokenEndIndex) < 0) {
      // no more function signature tokens, so we are in the body
      searchState = 5;
    }
  }
  functionTable.push(funcBranch);
  parseTree.module.children.push(funcBranch);
}


function genParseTree() {
  while (TokenArray[0].type === 'ws' || TokenArray[0].type === 'nl') {
    TokenArray.shift();
  }

  if (TokenArray[0].type !== 'lp' || TokenArray[1].text !== 'module') {
    logError(`no module found at the beginning of file: ${TokenArray[0].text}`, TokenArray[0]);
  }

  parseTree.module = Object.assign(TokenArray[1], TokenArray[1].value);

  //console.log(parseTree);
  for (index = 2; index < TokenArray.length; index++) {
    let currentToken = TokenArray[index];
    //console.log(`currentToken.type=${currentToken.type}`);
    if (currentToken.type === 'global_level' &&
      currentToken.level === 2 &&
      TokenArray[index - 1].type === 'lp') {
      // func|type|import|export|table|funcref|elem|global[^.]|memory
      switch (currentToken.text) {
        case 'func':
          genFunc(currentToken);
          break;
        case 'global':
          genGlobal(currentToken);
          break;
        case 'type':
        case 'import':
        case 'export':
        case 'table':
        case 'funcref':
        case 'elem':
        case 'memory':
          logError(`${currentToken.text} not implemented yet`, currentToken);
          break;
        default:
          logError(`${currentToken.text} illegal token`, currentToken);

      }
    }
  }
}

module.exports.genParseTree = genParseTree;
