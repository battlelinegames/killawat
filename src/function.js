const { exportToken, resultToken, paramToken, localToken } = require('./parser.js');
const { DATA_TYPE } = require('./tokenizer.js');
const { SymbolTableEntry, isNumber } = require('./symboltable.js');
const { WasmModule, binaryen } = require('./killawat.js');

const RED = '\x1b[31m';
const WHITE = '\x1b[37m';
const YELLOW = '\x1b[33m';

var functionTable = [];
module.exports.functionTable = functionTable;
var functionMap = new Map();
module.exports.functionMap = functionMap

class FuncTableEntry {
  constructor(name, export_name, index) {
    this.name = name;
    this.export_name = export_name;
    this.result = binaryen.none;
    this.params = [];
    this.locals = [];
    this.blockTokens = [];
    this.blockTokenStack = [];
    this.blockExpressions = [];
    this.index = index;
    functionMap.set(name, this);
    this.localMap = new Map();
  }

  get paramCount() {
    return this.params.length;
  }

  get localCount() {
    return this.locals.length;
  }

  AddLocal(var_name, var_type) {
    let variable = new SymbolTableEntry(
      var_name,
      var_type,
      this.locals.length + this.params.length
    );
    this.locals.push(variable);
    this.localMap.set(var_name, variable);
  }

  AddParam(var_name, var_type) {
    let variable = new SymbolTableEntry(
      var_name,
      var_type,
      this.params.length
    );
    this.localMap.set(var_name, variable);
    this.params.push(variable);
  }

  GetLocal(var_id) {
    if (isNumber(var_id)) {
      let var_num = parseInt(var_id);
      if (var_num >= this.params.length) {
        var_num -= this.params.length;
        return this.locals[var_num];
      }
      else {
        return this.params[var_num];
      }
    }
    else {
      return this.localMap.get(var_id);
    }
  }
}

module.exports.FuncTableEntry = FuncTableEntry;

function countParameters(func_id) {
  // FIND THE PARAMETERS IN A FUNCTION
  if (func_id == null) {
    return 0;
  }

  if (isNumber(func_id)) {
    let func = functionTable[parseInt(func_id)];
    return func.paramCount();
  }
  else {
    let func = functionMap.get(function_name);
    return func.paramCount();
  }
}

module.exports.countParameters = countParameters;

function consumeCount(keyword) {//, token_pos) {
  switch (keyword) {
    //case "call":
    //case "call_indirect":
    //  return countParameters(func_id);
    // CONTROL FLOW
    case "if":
    case "br_if":
    case "drop":
    case "local.set":
    case "set_local":
    case "global.set":
    case "set_global":
    case "i32.clz":
    case "i32.ctz":
    case "i32.popcnt":
    case "i32.eqz":

    // I64
    case "i64.clz":
    case "i64.ctz":
    case "i64.popcnt":
    case "i64.eqz":

    // F32
    case "f32.neg":
    case "f32.abs":
    case "f32.ceil":
    case "f32.floor":
    case "f32.trunc":
    case "f32.nearest":
    case "f32.sqrt":

    // F64
    case "f64.neg":
    case "f64.abs":
    case "f64.ceil":
    case "f64.floor":
    case "f64.trunc":
    case "f64.nearest":
    case "f64.sqrt":

    case "i32.trunc_s.f32":
    case "i32.trunc_s/f32":
    case "i32.trunc_s[f32]":
    case "i32.trunc_s_f32":
    case "i32.trunc_f32_s":

    case "i32.trunc_u.f32":
    case "i32.trunc_u/f32":
    case "i32.trunc_u[f32]":
    case "i32.trunc_u_f32":
    case "i32.trunc_f32_u":

    case "i32.reinterpret":
    case "i32.reinterpret.f32":
    case "i32.reinterpret/f32":
    case "i32.reinterpret[f32]":
    case "i32.reinterpret_f32":

    // I64 DATATYPE CONVERSION
    case "i64.trunc_s.f32":
    case "i64.trunc_s/f32":
    case "i64.trunc_s[f32]":
    case "i64.trunc_s_f32":
    case "i64.trunc_f32_s":

    case "i64.trunc_u.f32":
    case "i64.trunc_u/f32":
    case "i64.trunc_u[f32]":
    case "i64.trunc_u_f32":
    case "i64.trunc_f32_u":

    case "f64.promote":
    case "f64.promote.f32":
    case "f64.promote/f32":
    case "f64.promote[f32]":
    case "f64.promote_f32":

    case "f32.demote":
    case "f32.demote.f64":
    case "f32.demote/f64":
    case "f32.demote[f64]":
    case "f32.demote_f64":

    case "i32.trunc_s.f64":
    case "i32.trunc_s/f64":
    case "i32.trunc_s[f64]":
    case "i32.trunc_s_f64":
    case "i32.trunc_f64_s":

    case "i32.trunc_u.f64":
    case "i32.trunc_u/f64":
    case "i32.trunc_u[f64]":
    case "i32.trunc_u_f64":
    case "i32.trunc_f64_u":

    case "i64.trunc_s.f64":
    case "i64.trunc_s/f64":
    case "i64.trunc_s[f64]":
    case "i64.trunc_s_f64":
    case "i64.trunc_f64_s":

    case "i64.trunc_u.f64":
    case "i64.trunc_u/f64":
    case "i64.trunc_u[f64]":
    case "i64.trunc_u_f64":
    case "i64.trunc_f64_u":

    case "i64.reinterpret":
    case "i64.reinterpret.f64":
    case "i64.reinterpret/f64":
    case "i64.reinterpret[f64]":
    case "i64.reinterpret_f64":

    case "i64.extend_s":
    case "i64.extend_s.i32":
    case "i64.extend_s/i32":
    case "i64.extend_s[i32]":
    case "i64.extend_s_i32":
    case "i64.extend_i32_s":

    case "i64.extend_u":
    case "i64.extend_u.i32":
    case "i64.extend_u/i32":
    case "i64.extend_u[i32]":
    case "i64.extend_u_i32":
    case "i64.extend_i32_u":

    // F32 DATATYPE CONVERSION
    case "f32.reinterpret":
    case "f32.reinterpret.i32":
    case "f32.reinterpret/i32":
    case "f32.reinterpret[i32]":
    case "f32.reinterpret_i32":

    case "f32.convert_s":
    case "f32.convert_s.i32":
    case "f32.convert_s/i32":
    case "f32.convert_s[i32]":
    case "f32.convert_s_i32":
    case "f32.convert_i32_s":

    case "f32.convert_u":
    case "f32.convert_u.i32":
    case "f32.convert_u/i32":
    case "f32.convert_u[i32]":
    case "f32.convert_u_i32":
    case "f32.convert_u_i32_u":

    case "f64.convert_s.i32":
    case "f64.convert_s/i32":
    case "f64.convert_s[i32]":
    case "f64.convert_s_i32":
    case "f64.convert_i32_s":

    case "f64.convert_u.i32":
    case "f64.convert_u/i32":
    case "f64.convert_u[i32]":
    case "f64.convert_u_i32":
    case "f64.convert_i32_u":

    case "i32.wrap":
    case "i32.wrap.i64":
    case "i32.wrap/i64":
    case "i32.wrap[i64]":
    case "i32.wrap_i64":

    case "f32.convert_s":
    case "f32.convert_s.i64":
    case "f32.convert_s/i64":
    case "f32.convert_s[i64]":
    case "f32.convert_s_i64":
    case "f32.convert_i64_s":

    case "f32.convert_u":
    case "f32.convert_u.i64":
    case "f32.convert_u/i64":
    case "f32.convert_u[i64]":
    case "f32.convert_u_i64":
    case "f32.convert_i64_u":

    // F64 DATATYPE CONVERSION
    case "f64.reinterpret":
    case "f64.reinterpret.i64":
    case "f64.reinterpret/i64":
    case "f64.reinterpret[i64]":
    case "f64.reinterpret_i64":

    case "f64.convert_s.i64":
    case "f64.convert_s/i64":
    case "f64.convert_s[i64]":
    case "f64.convert_s_i64":
    case "f64.convert_i64_s":

    case "f64.convert_u.i64":
    case "f64.convert_u/i64":
    case "f64.convert_u[i64]":
    case "f64.convert_u_i64":
    case "f64.convert_i64_u":

    // I32 LINEAR MEMORY
    case "i32.load":
    case "i32.load8_s":
    case "i32.load8_u":
    case "i32.load16_s":
    case "i32.load16_u":

    // I64 LINEAR MEMORY
    case "i64.load":
    case "i64.load8_s":
    case "i64.load8_u":
    case "i64.load16_s":
    case "i64.load16_u":
    case "i64.load32_s":
    case "i64.load32_u":

    // F32 LINEAR MEMORY
    case "f32.load":

    // F64 LINEAR MEMORY
    case "f64.load":
      return 1;

    case "i32.add":
    case "i32.sub":
    case "i32.mul":
    case "i32.div_s":
    case "i32.div_u":
    case "i32.rem_s":
    case "i32.rem_u":
    case "i32.and":
    case "i32.or":
    case "i32.xor":
    case "i32.shl":
    case "i32.shr_s":
    case "i32.shr_u":
    case "i32.rotl":
    case "i32.rotr":
    case "i32.eq":
    case "i32.ne":

    case "i32.lt_s":
    case "i32.lt_u":
    case "i32.le_s":
    case "i32.le_u":
    case "i32.gt_s":
    case "i32.gt_u":
    case "i32.ge_s":
    case "i32.ge_u":

    case "i64.add":
    case "i64.sub":
    case "i64.mul":
    case "i64.div_s":
    case "i64.div_u":
    case "i64.rem_s":
    case "i64.rem_u":
    case "i64.and":
    case "i64.or":
    case "i64.xor":
    case "i64.shl":
    case "i64.shr_s":
    case "i64.shr_u":
    case "i64.rotl":
    case "i64.rotr":
    case "i64.eq":
    case "i64.ne":

    case "i64.lt_s":
    case "i64.lt_u":
    case "i64.le_s":
    case "i64.le_u":

    case "i64.gt_s":
    case "i64.gt_u":
    case "i64.ge_s":
    case "i64.ge_u":

    case "f32.add":
    case "f32.sub":
    case "f32.mul":
    case "f32.div":
    case "f32.copysign":
    case "f32.min":
    case "f32.max":
    case "f32.eq":
    case "f32.ne":
    case "f32.lt":
    case "f32.le":
    case "f32.gt":
    case "f32.ge":

    case "f64.add":
    case "f64.sub":
    case "f64.mul":
    case "f64.div":
    case "f64.copysign":
    case "f64.min":
    case "f64.max":
    case "f64.eq":
    case "f64.ne":
    case "f64.lt":
    case "f64.le":
    case "f64.gt":
    case "f64.ge":

    case "i32.store":
    case "i32.store8":
    case "i32.store16":

    case "i64.store":
    case "i64.store8":
    case "i64.store16":
    case "i64.store32":


    case "f32.store":
    case "f64.store":
      return 2;
    default:
      return 0;
  }
}

module.exports.consumeCount = consumeCount;


function funcToken(token_array,
  token_pos) {
  let level = 1;
  let name = null;
  let export_name = null;
  let func_table_entry = null;

  while (level > 0) {
    let token = token_array[++token_pos];
    //console.log(token);
    if (token.type === "name") {
      name = token.value;
    }
    else if (token.type === "lp") {
      level++;
    }
    else if (token.type === "rp") {
      level--;
    }
    else if (token.type === "keyword") {
      switch (token.value) {
        case "export":
          let { n, pos } = exportToken(token_array, token_pos);
          export_name = n;
          token_pos = pos;
          break;
        case "local":
          if (func_table_entry == null) {
            func_table_entry = new FuncTableEntry(name,
              export_name,
              functionTable.length)
            functionTable.push(func_table_entry);
          }
          localToken(token_array, token_pos, func_table_entry);
          break;
        case "param":
          if (func_table_entry == null) {
            func_table_entry = new FuncTableEntry(name,
              export_name,
              functionTable.length)
            functionTable.push(func_table_entry);
          }
          paramToken(token_array, token_pos, func_table_entry);
          break;
        case "result":
          if (func_table_entry == null) {
            func_table_entry = new FuncTableEntry(name,
              export_name,
              functionTable.length)
            functionTable.push(func_table_entry);
          }
          resultToken(token_array, token_pos, func_table_entry);
          break;
        default:
          if (level === 1) {
            if (func_table_entry == null) {
              func_table_entry = new FuncTableEntry(name,
                export_name,
                functionTable.length)
              functionTable.push(func_table_entry);
            }
            functionBlockTokens(token_array, token_pos,
              func_table_entry);
            return;
          }
          else if (level === 2 &&
            token_array[token_pos - 1].type === 'lp') {
            if (func_table_entry == null) {
              func_table_entry = new FuncTableEntry(name,
                export_name,
                functionTable.length)
              functionTable.push(func_table_entry);
            }
            functionBlockTokens(token_array, token_pos - 1,
              func_table_entry);
            return;
          }
      }
    }
    else {
      //console.log('else');
    }
  }
  //console.log(func_table_entry);
}

module.exports.funcToken = funcToken;

function functionBlockTokens(token_array, token_pos, funcTableEntry) {
  //console.log("============= FUNCTION BLOCK TOKENS ====================");
  let level = 1;
  while (token_array[token_pos] !== 'rp' || level !== 1) {
    let token = token_array[token_pos++];
    if (token != null) {
      if (token.type === 'lp') {
        level++;
      }
      else if (token.type === 'rp') {
        level--;
      }
      funcTableEntry.blockTokens.push(token);
    }
    else {
      break;
    }
  }

}

function stackifyIf(func_table_entry, token_pos, if_token) {
  // find (then) expression for start of block
  // find (else) expression
  var then_pos = -1;
  //var if_token = func_table_entry.blockTokens[token_pos];
  var else_token = null;
  var i = 0;

  // 'then' keyword lookahead
  for (i = token_pos; i < func_table_entry.blockTokens.length; i++) {
    let token = func_table_entry.blockTokens[i];
    if (token.type === 'keyword' &&
      token.value === 'then') {
      then_pos = i - 1;
    }
  }

  if (then_pos !== -1) {
    for (i = token_pos; i < then_pos; i++) {
      let token = func_table_entry.blockTokens[i];
      if (token.type === 'lp') {
        i = stackifyExpr(func_table_entry, i + 1);
      }
      else {
        //console.log(`${YELLOW}stackify dropping ${token.type} token${WHITE}`);
      }
    }
    func_table_entry.blockTokenStack.push(if_token);
    i = stackifyExpr(func_table_entry, i + 1);

    var else_pos = -1;

    // 'else' keyword lookahead
    for (let j = i; j < func_table_entry.blockTokens.length; j++) {
      let token = func_table_entry.blockTokens[j];
      if (token.type === 'keyword' &&
        token.value === 'else') {
        else_token = token;
        else_pos = j;
      }
    }

    if (else_token != null) {
      func_table_entry.blockTokenStack.push(else_token);
      i = stackifyExpr(func_table_entry, else_pos);
    }
    else {
      //console.log(`no else found`);
    }

    let token = func_table_entry.blockTokens[i - 1];
    let token_copy = new Object();

    Object.assign(token_copy, token);
    token_copy.type = 'keyword';
    token_copy.value = 'end';
    token_copy.text = 'end';
    func_table_entry.blockTokenStack.push(token_copy);

  }

  // add if to stack
  // after then, create stack expression
  // look for else
  // if 'else' token exists add 'else' to stack otherwise add 'end' to stack
  // if 'else' exists add 'block' followed by 'end'
}


function stackifyExpr(func_table_entry, token_pos) {
  let save_keyword = null;
  let save_literal = null;
  let save_name = null;

  for (let i = token_pos; i < func_table_entry.blockTokens.length; i++) {
    let token = func_table_entry.blockTokens[i];
    if (token.type === 'rp') {
      func_table_entry.blockTokenStack.push(save_keyword);
      if (save_literal != null) {
        func_table_entry.blockTokenStack.push(save_literal);
      }
      if (save_name != null) {
        func_table_entry.blockTokenStack.push(save_name);
      }
      return i;
    }
    else if (token.type === 'keyword') {
      save_keyword = token; // THIS IS WHAT WAS THERE
      // WHAT TO DO ABOUT (if (value) (then ) (else ) )
      if (token.value === 'if') {
        i = stackifyIf(func_table_entry, i + 1, save_keyword);
      }
      else if (token.value === 'block') {
        func_table_entry.blockTokenStack.push('block');
        i = stackifyExpr(func_table_entry, i + 1);
        func_table_entry.blockTokenStack.push('end');
      }
      else if (token.value === 'loop') {
        func_table_entry.blockTokenStack.push('loop');
        i = stackifyExpr(func_table_entry, i + 1);
        func_table_entry.blockTokenStack.push('end');
      }
      else if (token.value === 'br_table') {
      }
      else if (token.value === 'br_if') {
      }
    }
    else if (token.type === 'int_literal' ||
      token.type === 'float_literal') {
      save_literal = token;
    }
    else if (token.type === 'name') {
      save_name = token;
    }
    else if (token.type === 'lp') {
      i = stackifyExpr(func_table_entry, i + 1);
    }
    else {
      //console.log(`${YELLOW}stackify dropping ${token.type} token${WHITE}`);
    }
  }
}

function buildBlockTokenStack(func_table_entry) {
  for (let i = 0; i < func_table_entry.blockTokens.length; i++) {
    let token = func_table_entry.blockTokens[i];
    if (token.type === "lp") {
      i = stackifyExpr(func_table_entry, i + 1);
    }
    else if (token.type === 'keyword' ||
      token.type === 'int_literal' ||
      token.type === 'name') {
      func_table_entry.blockTokenStack.push(token);
    }
    else if (token.type === "rp") {
      // BECAUSE WE ARE NOT IN A TREE THIS IS THE END OF THE EXPR
      return;
    }
  }

}

module.exports.buildBlockTokenStack = buildBlockTokenStack;

function buildBlockExpressions(func_table_entry, token_pos = 0) {
  var temp_stack = [];
  for (let i = token_pos; i < func_table_entry.blockTokenStack.length; i++) {
    let token = func_table_entry.blockTokenStack[i];
    if (token.type === "keyword") {
      let literal;
      let expr;
      let local;
      let val;
      let right;
      let left;
      let if_block;
      let else_block;
      let offset = 0;
      let align = 0;
      let temp;

      //console.log(`token value:${token.value}`);

      switch (token.value) {
        case "i32.const":
          // the int_literal type should probably have a value that is an int
          literal = parseInt(func_table_entry.blockTokenStack[++i].value);
          expr = WasmModule.i32.const(literal);
          temp_stack.push(expr);
          // I should probably also do something to decode binary & hex
          break;
        case "f32.const":
          literal = parseFloat(func_table_entry.blockTokenStack[++i].value);
          expr = WasmModule.f32.const(literal);
          temp_stack.push(expr);
          break;
        case "i64.const":
          let big_literal = BigInt(func_table_entry.blockTokenStack[++i].value);
          let low_bytes = parseInt(big_literal & 0xff_ff_ff_ffn);
          let high_bytes = parseInt(big_literal >> 32n);
          expr = WasmModule.i64.const(low_bytes, high_bytes);
          temp_stack.push(expr);
          break;
        case "f64.const":
          literal = parseFloat(func_table_entry.blockTokenStack[++i].value);
          expr = WasmModule.f64.const(literal);
          temp_stack.push(expr);
          break;
        case "local.get":
          local = func_table_entry.GetLocal(
            func_table_entry.blockTokenStack[++i].value
          );
          expr = WasmModule.local.get(local.index, local.type);
          temp_stack.push(expr);
          break;
        case "global.get":
          // DO THIS LATER
          break;
        case "i32.add":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.add(left, right);
          temp_stack.push(expr);
          break;
        case "local.set":
          val = temp_stack.pop();
          local = func_table_entry.GetLocal(
            func_table_entry.blockTokenStack[++i].value
          );
          expr = WasmModule.local.set(local.index, val)
          temp_stack.push(expr);
          break;

        // BEGINNING OF COMPLETE LIST ==============================================
        case "block":
          let block_name = func_table_entry.blockTokenStack[++i].value;
          temp = buildBlockExpressions(func_table_entry, i + 1);
          block_expr = WasmModule.block(block_name,
            temp.stack
          );

          i = temp.pos;
          temp_stack.push(block_expr);

          break;
        case "if":
          // WHAT THE HELL AM I DOING HERE?!?!?!?
          // I DON'T BELONG HERE
          val = temp_stack.pop();
          temp = buildBlockExpressions(func_table_entry, i + 1);

          if_block = WasmModule.block(null,
            temp.stack
          );

          i = temp.pos;

          if (temp.else) {
            temp = buildBlockExpressions(func_table_entry, i + 1);
            else_block = WasmModule.block(null,
              temp.stack
            );
            i = temp.pos;
            expr = WasmModule.if(val, if_block, else_block);
            temp_stack.push(expr);
          }
          else {
            expr = WasmModule.if(
              //val,
              WasmModule.local.get(0, binaryen.i32),
              if_block,
              null);
            temp_stack.push(expr);
          }
          break;
        // I THINK THIS ELSE MUST CHANGE
        case "else":
          return {
            stack: temp_stack,
            else: true,
            pos: i
          }
        case "end":
          return {
            stack: temp_stack,
            else: false,
            pos: i + 1
          }
        case "br_if":
        // NOT SURE WHAT GOES HERE
        // MAYBE A COMBINATION OF IF AND BR
        case "drop":
          val = temp_stack.pop();
          expr = WasmModule.drop(val);
          temp_stack.push(expr);
          break;
        case "local.set":
          local = func_table_entry.GetLocal(
            func_table_entry.blockTokenStack[++i].value
          );
          expr = WasmModule.local.get(local.index, local.type);
          temp_stack.push(expr);
          break;
        case "global.set":
        // DO THIS LATER
        case "i32.clz":
          val = temp_stack.pop();
          expr = WasmModule.i32.clz(val);
          temp_stack.push(expr);
          break;
        case "i32.ctz":
          val = temp_stack.pop();
          expr = WasmModule.i32.ctz(val);
          temp_stack.push(expr);
          break;
        case "i32.popcnt":
          val = temp_stack.pop();
          expr = WasmModule.i32.popcnt(val);
          temp_stack.push(expr);
          break;
        case "i32.eqz":
          val = temp_stack.pop();
          expr = WasmModule.i32.eqz(val);
          temp_stack.push(expr);
          break;

        // I64
        case "i64.clz":
          val = temp_stack.pop();
          expr = WasmModule.i64.clz(val);
          temp_stack.push(expr);
          break;
        case "i64.ctz":
          val = temp_stack.pop();
          expr = WasmModule.i64.ctz(val);
          temp_stack.push(expr);
          break;
        case "i64.popcnt":
          val = temp_stack.pop();
          expr = WasmModule.i64.popcnt(val);
          temp_stack.push(expr);
          break;
        case "i64.eqz":
          val = temp_stack.pop();
          expr = WasmModule.i64.eqz(val);
          temp_stack.push(expr);
          break;

        // F32
        case "f32.neg":
          val = temp_stack.pop();
          expr = WasmModule.f32.neg(val);
          temp_stack.push(expr);
          break;
        case "f32.abs":
          val = temp_stack.pop();
          expr = WasmModule.f32.abs(val);
          temp_stack.push(expr);
          break;
        case "f32.ceil":
          val = temp_stack.pop();
          expr = WasmModule.f32.ceil(val);
          temp_stack.push(expr);
          break;
        case "f32.floor":
          val = temp_stack.pop();
          expr = WasmModule.f32.floor(val);
          temp_stack.push(expr);
          break;
        case "f32.trunc":
          val = temp_stack.pop();
          expr = WasmModule.f32.trunc(val);
          temp_stack.push(expr);
          break;
        case "f32.nearest":
          val = temp_stack.pop();
          expr = WasmModule.f32.nearest(val);
          temp_stack.push(expr);
          break;
        case "f32.sqrt":
          val = temp_stack.pop();
          expr = WasmModule.f32.sqrt(val);
          temp_stack.push(expr);
          break;

        // F64
        case "f64.neg":
          val = temp_stack.pop();
          expr = WasmModule.f64.neg(val);
          temp_stack.push(expr);
          break;
        case "f64.abs":
          val = temp_stack.pop();
          expr = WasmModule.f64.abs(val);
          temp_stack.push(expr);
          break;
        case "f64.ceil":
          val = temp_stack.pop();
          expr = WasmModule.f64.ceil(val);
          temp_stack.push(expr);
          break;
        case "f64.floor":
          val = temp_stack.pop();
          expr = WasmModule.f64.floor(val);
          temp_stack.push(expr);
          break;
        case "f64.trunc":
          val = temp_stack.pop();
          expr = WasmModule.f64.trunc(val);
          temp_stack.push(expr);
          break;
        case "f64.nearest":
          val = temp_stack.pop();
          expr = WasmModule.f64.nearest(val);
          temp_stack.push(expr);
          break;
        case "f64.sqrt":
          val = temp_stack.pop();
          expr = WasmModule.f64.sqrt(val);
          temp_stack.push(expr);
          break;

        case "i32.trunc_s.f32":
        case "i32.trunc_s/f32":
        case "i32.trunc_s[f32]":
        case "i32.trunc_s_f32":
        case "i32.trunc_f32_s":
          val = temp_stack.pop();
          expr = WasmModule.i32.trunc_s.f32(val);
          temp_stack.push(expr);
          break;

        case "i32.trunc_u.f32":
        case "i32.trunc_u/f32":
        case "i32.trunc_u[f32]":
        case "i32.trunc_u_f32":
        case "i32.trunc_f32_u":
          val = temp_stack.pop();
          expr = WasmModule.i32.trunc_u.f32(val);
          temp_stack.push(expr);
          break;

        case "i32.reinterpret":
        case "i32.reinterpret.f32":
        case "i32.reinterpret/f32":
        case "i32.reinterpret[f32]":
        case "i32.reinterpret_f32":
          val = temp_stack.pop();
          expr = WasmModule.i32.reinterpret.f32(val);
          temp_stack.push(expr);
          break;

        // I64 DATATYPE CONVERSION
        case "i64.trunc_s.f32":
        case "i64.trunc_s/f32":
        case "i64.trunc_s[f32]":
        case "i64.trunc_s_f32":
        case "i64.trunc_f32_s":
          val = temp_stack.pop();
          expr = WasmModule.i64.trunc_s.f32(val);
          temp_stack.push(expr);
          break;

        case "i64.trunc_u.f32":
        case "i64.trunc_u/f32":
        case "i64.trunc_u[f32]":
        case "i64.trunc_u_f32":
        case "i64.trunc_f32_u":
          val = temp_stack.pop();
          expr = WasmModule.i64.trunc_u.f32(val);
          temp_stack.push(expr);
          break;

        case "f64.promote":
        case "f64.promote.f32":
        case "f64.promote/f32":
        case "f64.promote[f32]":
        case "f64.promote_f32":
          val = temp_stack.pop();
          expr = WasmModule.f64.promote.f32(val);
          temp_stack.push(expr);
          break;

        case "f32.demote":
        case "f32.demote.f64":
        case "f32.demote/f64":
        case "f32.demote[f64]":
        case "f32.demote_f64":
          val = temp_stack.pop();
          expr = WasmModule.f32.demote.f64(val);
          temp_stack.push(expr);
          break;

        case "i32.trunc_s.f64":
        case "i32.trunc_s/f64":
        case "i32.trunc_s[f64]":
        case "i32.trunc_s_f64":
        case "i32.trunc_f64_s":
          val = temp_stack.pop();
          expr = WasmModule.i32.trunc_s.f64(val);
          temp_stack.push(expr);
          break;

        case "i32.trunc_u.f64":
        case "i32.trunc_u/f64":
        case "i32.trunc_u[f64]":
        case "i32.trunc_u_f64":
        case "i32.trunc_f64_u":
          val = temp_stack.pop();
          expr = WasmModule.i32.trunc_u.f64(val);
          temp_stack.push(expr);
          break;

        case "i64.trunc_s.f64":
        case "i64.trunc_s/f64":
        case "i64.trunc_s[f64]":
        case "i64.trunc_s_f64":
        case "i64.trunc_f64_s":
          val = temp_stack.pop();
          expr = WasmModule.i64.trunc_s.f64(val);
          temp_stack.push(expr);
          break;

        case "i64.trunc_u.f64":
        case "i64.trunc_u/f64":
        case "i64.trunc_u[f64]":
        case "i64.trunc_u_f64":
        case "i64.trunc_f64_u":
          val = temp_stack.pop();
          expr = WasmModule.i64.trunc_u.f64(val);
          temp_stack.push(expr);
          break;

        case "i64.reinterpret":
        case "i64.reinterpret.f64":
        case "i64.reinterpret/f64":
        case "i64.reinterpret[f64]":
        case "i64.reinterpret_f64":
          val = temp_stack.pop();
          expr = WasmModule.i64.reinterpret.f64(val);
          temp_stack.push(expr);
          break;

        case "i64.extend_s":
        case "i64.extend_s.i32":
        case "i64.extend_s/i32":
        case "i64.extend_s[i32]":
        case "i64.extend_s_i32":
        case "i64.extend_i32_s":
          val = temp_stack.pop();
          expr = WasmModule.i64.extend_s.i32(val);
          temp_stack.push(expr);
          break;

        case "i64.extend_u":
        case "i64.extend_u.i32":
        case "i64.extend_u/i32":
        case "i64.extend_u[i32]":
        case "i64.extend_u_i32":
        case "i64.extend_i32_u":
          val = temp_stack.pop();
          expr = WasmModule.i64.extend_u.i32(val);
          temp_stack.push(expr);
          break;

        // F32 DATATYPE CONVERSION
        case "f32.reinterpret":
        case "f32.reinterpret.i32":
        case "f32.reinterpret/i32":
        case "f32.reinterpret[i32]":
        case "f32.reinterpret_i32":
          val = temp_stack.pop();
          expr = WasmModule.f32.reinterpret.i32(val);
          temp_stack.push(expr);
          break;

        case "f32.convert_s":
        case "f32.convert_s.i32":
        case "f32.convert_s/i32":
        case "f32.convert_s[i32]":
        case "f32.convert_s_i32":
        case "f32.convert_i32_s":
          val = temp_stack.pop();
          expr = WasmModule.f32.convert_s.i32(val);
          temp_stack.push(expr);
          break;

        case "f32.convert_u":
        case "f32.convert_u.i32":
        case "f32.convert_u/i32":
        case "f32.convert_u[i32]":
        case "f32.convert_u_i32":
        case "f32.convert_u_i32_u":
          val = temp_stack.pop();
          expr = WasmModule.f32.convert_u.i32(val);
          temp_stack.push(expr);
          break;

        case "f64.convert_s.i32":
        case "f64.convert_s/i32":
        case "f64.convert_s[i32]":
        case "f64.convert_s_i32":
        case "f64.convert_i32_s":
          val = temp_stack.pop();
          expr = WasmModule.f64.convert_s.i32(val);
          temp_stack.push(expr);
          break;

        case "f64.convert_u.i32":
        case "f64.convert_u/i32":
        case "f64.convert_u[i32]":
        case "f64.convert_u_i32":
        case "f64.convert_i32_u":
          val = temp_stack.pop();
          expr = WasmModule.f64.convert_u.i32(val);
          temp_stack.push(expr);
          break;

        case "i32.wrap":
        case "i32.wrap.i64":
        case "i32.wrap/i64":
        case "i32.wrap[i64]":
        case "i32.wrap_i64":
          val = temp_stack.pop();
          expr = WasmModule.i32.wrap.i64(val);
          temp_stack.push(expr);
          break;

        case "f32.convert_s":
        case "f32.convert_s.i64":
        case "f32.convert_s/i64":
        case "f32.convert_s[i64]":
        case "f32.convert_s_i64":
        case "f32.convert_i64_s":
          val = temp_stack.pop();
          expr = WasmModule.f32.convert_s.i64(val);
          temp_stack.push(expr);
          break;

        case "f32.convert_u":
        case "f32.convert_u.i64":
        case "f32.convert_u/i64":
        case "f32.convert_u[i64]":
        case "f32.convert_u_i64":
        case "f32.convert_i64_u":
          val = temp_stack.pop();
          expr = WasmModule.f32.convert_u.i64(val);
          temp_stack.push(expr);
          break;

        // F64 DATATYPE CONVERSION
        case "f64.reinterpret":
        case "f64.reinterpret.i64":
        case "f64.reinterpret/i64":
        case "f64.reinterpret[i64]":
        case "f64.reinterpret_i64":
          val = temp_stack.pop();
          expr = WasmModule.f64.reinterpret.i64(val);
          temp_stack.push(expr);
          break;

        case "f64.convert_s.i64":
        case "f64.convert_s/i64":
        case "f64.convert_s[i64]":
        case "f64.convert_s_i64":
        case "f64.convert_i64_s":
          val = temp_stack.pop();
          expr = WasmModule.f64.convert_s.i64(val);
          temp_stack.push(expr);
          break;

        case "f64.convert_u.i64":
        case "f64.convert_u/i64":
        case "f64.convert_u[i64]":
        case "f64.convert_u_i64":
        case "f64.convert_i64_u":
          val = temp_stack.pop();
          expr = WasmModule.f64.convert_u.i64(val);
          temp_stack.push(expr);
          break;

        // I32 LINEAR MEMORY
        case "i32.load":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i32.load(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i32.load8_s":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i32.load8_s(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i32.load8_u":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i32.load8_u(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i32.load16_s":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i32.load16_s(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i32.load16_u":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i32.load16_u(offset, align, val);
          temp_stack.push(expr);
          break;

        // I64 LINEAR MEMORY
        case "i64.load":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.load(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i64.load8_s":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.load8_s(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i64.load8_u":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.load8_u(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i64.load16_s":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.load16_s(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i64.load16_u":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.load16_u(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i64.load32_s":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.load32_s(offset, align, val);
          temp_stack.push(expr);
          break;
        case "i64.load32_u":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.load32_u(offset, align, val);
          temp_stack.push(expr);
          break;

        // F32 LINEAR MEMORY
        case "f32.load":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.f32.load(offset, align, val);
          temp_stack.push(expr);
          break;

        // F64 LINEAR MEMORY
        case "f64.load":
          val = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.f64.load(offset, align, val);
          temp_stack.push(expr);
          break;

        case "i32.sub":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.sub(left, right);
          temp_stack.push(expr);
          break;
        case "i32.mul":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.mul(left, right);
          temp_stack.push(expr);
          break;
        case "i32.div_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.div_s(left, right);
          temp_stack.push(expr);
          break;
        case "i32.div_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.div_u(left, right);
          temp_stack.push(expr);
          break;
        case "i32.rem_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.rem_s(left, right);
          temp_stack.push(expr);
          break;
        case "i32.rem_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.rem_u(left, right);
          temp_stack.push(expr);
          break;
        case "i32.and":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.and(left, right);
          temp_stack.push(expr);
          break;
        case "i32.or":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.or(left, right);
          temp_stack.push(expr);
          break;
        case "i32.xor":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.xor(left, right);
          temp_stack.push(expr);
          break;
        case "i32.shl":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.shl(left, right);
          temp_stack.push(expr);
          break;
        case "i32.shr_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.shr_s(left, right);
          temp_stack.push(expr);
          break;
        case "i32.shr_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.shr_u(left, right);
          temp_stack.push(expr);
          break;
        case "i32.rotl":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.rotl(left, right);
          temp_stack.push(expr);
          break;
        case "i32.rotr":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.rotr(left, right);
          temp_stack.push(expr);
          break;
        case "i32.eq":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.eq(left, right);
          temp_stack.push(expr);
          break;
        case "i32.ne":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.ne(left, right);
          temp_stack.push(expr);
          break;

        case "i32.lt_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.lt_s(left, right);
          temp_stack.push(expr);
          break;

        case "i32.lt_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.lt_u(left, right);
          temp_stack.push(expr);
          break;

        case "i32.le_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.le_s(left, right);
          temp_stack.push(expr);
          break;

        case "i32.le_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.le_u(left, right);
          temp_stack.push(expr);
          break;

        case "i32.gt_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.gt_s(left, right);
          temp_stack.push(expr);
          break;

        case "i32.gt_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.gt_u(left, right);
          temp_stack.push(expr);
          break;

        case "i32.ge_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.ge_s(left, right);
          temp_stack.push(expr);
          break;

        case "i32.ge_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i32.ge_u(left, right);
          temp_stack.push(expr);
          break;


        case "i64.add":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.add(left, right);
          temp_stack.push(expr);
          break;

        case "i64.sub":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.sub(left, right);
          temp_stack.push(expr);
          break;

        case "i64.mul":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.mul(left, right);
          temp_stack.push(expr);
          break;

        case "i64.div_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.div_s(left, right);
          temp_stack.push(expr);
          break;

        case "i64.div_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.div_u(left, right);
          temp_stack.push(expr);
          break;

        case "i64.rem_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.rem_s(left, right);
          temp_stack.push(expr);
          break;

        case "i64.rem_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.rem_u(left, right);
          temp_stack.push(expr);
          break;

        case "i64.and":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.and(left, right);
          temp_stack.push(expr);
          break;

        case "i64.or":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.or(left, right);
          temp_stack.push(expr);
          break;

        case "i64.xor":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.xor(left, right);
          temp_stack.push(expr);
          break;

        case "i64.shl":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.shl(left, right);
          temp_stack.push(expr);
          break;

        case "i64.shr_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.shr_s(left, right);
          temp_stack.push(expr);
          break;

        case "i64.shr_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.shr_u(left, right);
          temp_stack.push(expr);
          break;

        case "i64.rotl":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.rotl(left, right);
          temp_stack.push(expr);
          break;

        case "i64.rotr":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.rotr(left, right);
          temp_stack.push(expr);
          break;

        case "i64.eq":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.eq(left, right);
          temp_stack.push(expr);
          break;

        case "i64.ne":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.ne(left, right);
          temp_stack.push(expr);
          break;


        case "i64.lt_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.lt_s(left, right);
          temp_stack.push(expr);
          break;

        case "i64.lt_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.lt_u(left, right);
          temp_stack.push(expr);
          break;

        case "i64.le_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.le_s(left, right);
          temp_stack.push(expr);
          break;

        case "i64.le_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.le_u(left, right);
          temp_stack.push(expr);
          break;

        case "i64.gt_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.gt_s(left, right);
          temp_stack.push(expr);
          break;

        case "i64.gt_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.gt_u(left, right);
          temp_stack.push(expr);
          break;

        case "i64.ge_s":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.ge_s(left, right);
          temp_stack.push(expr);
          break;

        case "i64.ge_u":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.i64.ge_u(left, right);
          temp_stack.push(expr);
          break;


        case "f32.add":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.add(left, right);
          temp_stack.push(expr);
          break;

        case "f32.sub":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.sub(left, right);
          temp_stack.push(expr);
          break;

        case "f32.mul":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.mul(left, right);
          temp_stack.push(expr);
          break;

        case "f32.div":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.div(left, right);
          temp_stack.push(expr);
          break;

        case "f32.copysign":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.copysign(left, right);
          temp_stack.push(expr);
          break;

        case "f32.min":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.min(left, right);
          temp_stack.push(expr);
          break;

        case "f32.max":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.max(left, right);
          temp_stack.push(expr);
          break;

        case "f32.eq":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.eq(left, right);
          temp_stack.push(expr);
          break;

        case "f32.ne":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.ne(left, right);
          temp_stack.push(expr);
          break;

        case "f32.lt":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.lt(left, right);
          temp_stack.push(expr);
          break;

        case "f32.le":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.le(left, right);
          temp_stack.push(expr);
          break;

        case "f32.gt":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.gt(left, right);
          temp_stack.push(expr);
          break;

        case "f32.ge":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f32.ge(left, right);
          temp_stack.push(expr);
          break;


        case "f64.add":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.add(left, right);
          temp_stack.push(expr);
          break;

        case "f64.sub":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.sub(left, right);
          temp_stack.push(expr);
          break;

        case "f64.mul":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.mul(left, right);
          temp_stack.push(expr);
          break;

        case "f64.div":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.div(left, right);
          temp_stack.push(expr);
          break;

        case "f64.copysign":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.copysign(left, right);
          temp_stack.push(expr);
          break;

        case "f64.min":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.min(left, right);
          temp_stack.push(expr);
          break;

        case "f64.max":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.max(left, right);
          temp_stack.push(expr);
          break;

        case "f64.eq":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.eq(left, right);
          temp_stack.push(expr);
          break;

        case "f64.ne":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.ne(left, right);
          temp_stack.push(expr);
          break;

        case "f64.lt":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.lt(left, right);
          temp_stack.push(expr);
          break;

        case "f64.le":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.le(left, right);
          temp_stack.push(expr);
          break;

        case "f64.gt":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.gt(left, right);
          temp_stack.push(expr);
          break;

        case "f64.ge":
          right = temp_stack.pop();
          left = temp_stack.pop();
          expr = WasmModule.f64.ge(left, right);
          temp_stack.push(expr);
          break;

        case "i32.store":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i32.store(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "i32.store8":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i32.store8(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "i32.store16":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i32.store16(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "i64.store":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.store(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "i64.store8":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.store8(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "i64.store16":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.store16(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "i64.store32":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.i64.store32(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "f32.store":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.f32.store(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "f64.store":
          right = temp_stack.pop();
          left = temp_stack.pop();
          offset = 0; // temporarily set to 0
          align = 0; // temporarily set to 0
          expr = WasmModule.f64.store(offset, align, left, right);
          temp_stack.push(expr);
          break;

        case "nop":
          expr = WasmModule.nop();
          temp_stack.push(expr);
          break;
        // END OF COMPLETE LIST ====================================================
        default:
          console.log(`${RED}
          unrecognized keyword: "${token.value}"
            line: ${token.line} 
            column: ${token.col}
          ${WHITE}
          `);
      }
    }
  }

  if (func_table_entry.result !== DATA_TYPE.NONE) {
    expr = WasmModule.return(temp_stack.pop());
    temp_stack.push(expr);
  }

  for (let i = 0; i < temp_stack.length; i++) {
    func_table_entry.blockExpressions.push(temp_stack[i]);
  }

}

module.exports.buildBlockExpressions = buildBlockExpressions;

var function_counter = 0;

function buildFuncExpression(func_table_entry) {
  let param_types = [];
  for (let i = 0; i < func_table_entry.params.length; i++) {
    param_types.push(func_table_entry.params[i].type);
  }

  let local_types = [];
  for (let i = 0; i < func_table_entry.locals.length; i++) {
    local_types.push(func_table_entry.locals[i].type);
  }

  let block = WasmModule.block(null,
    func_table_entry.blockExpressions
  );

  let param_array = [];
  for (let i = 0; i < func_table_entry.params.length; i++) {
    param_array.push(func_table_entry.params[i].type);
  }

  let local_array = [];
  for (let i = 0; i < func_table_entry.locals.length; i++) {
    local_array.push(func_table_entry.locals[i].type);
  }

  if (func_table_entry.name == null ||
    func_table_entry.name.match(/\$f[0-9]+/)) {
    func_table_entry.name = `f${function_counter++}`;
  }
  WasmModule.addFunction(func_table_entry.name,
    binaryen.createType(param_array), //func_table_entry.params,
    func_table_entry.result,
    local_array,
    block
  );

  if (func_table_entry.export_name != null) {
    WasmModule.addFunctionExport(func_table_entry.name,
      func_table_entry.export_name);
  }
}



module.exports.buildFuncExpression = buildFuncExpression;
