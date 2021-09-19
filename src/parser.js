const binaryen = require("binaryen");
const { DATA_TYPE } = require('./tokenizer.js');

//let token_array = []
var wat_stack = [];

module.exports.parser = function parser(token_array, start_token = 0) {
}

function localToken(token_array, token_pos, funcTableEntry) {
  let token = token_array[++token_pos];
  let name = null;
  let local_added = false;
  while (token.type !== 'rp') {
    if (token.type === 'name') {
      name = token.value;
    }
    else if (token.type === 'keyword') {
      if (local_added === true) {
        console.log(`
        ${RED}
        unexpected keyword ${token.text}
        ${WHITE}
        `);
      }
      else if (token.value === 'i32') {
        funcTableEntry.AddLocal(name, DATA_TYPE.I32);
        local_added = true;
      }
      else if (token.value === 'i64') {
        funcTableEntry.AddLocal(name, DATA_TYPE.I64);
        local_added = true;
      }
      else if (token.value === 'f32') {
        funcTableEntry.AddLocal(name, DATA_TYPE.F32);
        local_added = true;
      }
      else if (token.value === 'f64') {
        funcTableEntry.AddLocal(name, DATA_TYPE.F64);
        local_added = true;
      }
    }
    token = token_array[++token_pos];
  }
}

module.exports.localToken = localToken;

function paramToken(token_array, token_pos, funcTableEntry) {
  let token = token_array[++token_pos];
  let name = null;
  let param_added = false;
  while (token.type !== 'rp') {
    if (token.type === 'name') {
      name = token.value;
    }
    else if (token.type === 'keyword') {
      if (param_added === true) {
        console.log(`
        ${RED}
        unexpected keyword ${token.text}
        ${WHITE}
        `);
      }
      else if (token.value === 'i32') {
        funcTableEntry.AddParam(name, DATA_TYPE.I32);
        param_added = true;
      }
      else if (token.value === 'i64') {
        funcTableEntry.AddParam(name, DATA_TYPE.I64);
        param_added = true;
      }
      else if (token.value === 'f32') {
        funcTableEntry.AddParam(name, DATA_TYPE.F32);
        param_added = true;
      }
      else if (token.value === 'f64') {
        funcTableEntry.AddParam(name, DATA_TYPE.F64);
        param_added = true;
      }
    }
    token = token_array[++token_pos];
  }

}

module.exports.paramToken = paramToken;

function resultToken(token_array, token_pos, funcTableEntry) {
  let token = token_array[++token_pos];
  let result_added = false;
  while (token.type !== 'rp') {
    if (token.type === 'keyword') {
      if (result_added === true) {
        console.log(`
        ${RED}
        unexpected keyword ${token.text}
        ${WHITE}
        `);
      }
      else if (token.value === 'i32') {
        funcTableEntry.result = DATA_TYPE.I32;
        result_added = true;
      }
      else if (token.value === 'i64') {
        funcTableEntry.result = DATA_TYPE.I64;
        result_added = true;
      }
      else if (token.value === 'f32') {
        funcTableEntry.result = DATA_TYPE.F32;
        result_added = true;
      }
      else if (token.value === 'f64') {
        funcTableEntry.result = DATA_TYPE.F64;
        result_added = true;
      }
    }
    token = token_array[++token_pos];
  }
}

module.exports.resultToken = resultToken;

function exportToken(token_array, token_pos) {
  let token = token_array[token_pos];
  while (token.type !== 'rp') {
    if (token.type === 'string_literal') {
      return { n: token.value, pos: token_pos };
    }
    token = token_array[++token_pos];
  }
}

module.exports.exportToken = exportToken;
