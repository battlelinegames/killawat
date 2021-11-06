const { valtypeMap, moduleDefinitions, unaryArray, binaryArray, logError, typeMap } = require("./shared.js");

const binaryen = require("binaryen");
const moo = require("moo");


function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


function toString() {
  return `
  type: ${this.type}
  text: ${this.text}
  level: ${this.level}
  value: ${this.value}
  `.replaceAll('  ', '  '.repeat(this.level + 2));
}

class Tokenizer {
  constructor(code, tokenArray) {
    this.code = code;
    this.tokenArray = tokenArray;
    this.level = 0;
    this.prevLP = false;
    this.parenMatchStack = [];
    this.blockMatchStack = [];

    this.lexer = moo.compile({
      ws: /[ \t]+/,
      comment: {
        match: /(?:\(;(?:\n|.)*;\))|(?:;;[^\n]*)/, // /;;[^\n]*/,
        value: s => s.substring(1)
      },
      // ANYTHING THAT INCLUDES A LEFT OR RIGHT PAREN MUST COME IN FRONT OF THIS
      preprocess: {
        match: /!merge|!macro|!module|!private|!inline|!address|!len|!process|##|#/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      macro_param: {
        match: /!local|!const|!global|!body/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      macro_name: {
        match: /![a-z_A-Z][a-zA-Z_0-9]*/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      lp: {
        match: /\(/,
        value: s => {
          this.prevLP = true;
          return {
            level: ++this.level,
            result: null,
            value: s,
          }
        }
      },
      rp: {
        match: /\)/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level--,
            result: null,
            value: s,
          }
        }
      },
      comma: ",",       // MUST FIX
      lbracket: "[",    // MUST FIX
      rbracket: "]",    // MUST FIX
      string_literal: {
        match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            value: JSON.parse(s),
            result: null,
          }
        }
      },
      hex_literal: {
        match: /0x[0-9a-fA-F][0-9a-fA-F_]*/,
        value: s => {
          this.prevLP = false;
          s = s.replaceAll('_', '');
          let n = 0;
          let n_hi = 0;
          let isBig = false;
          if (s.length < 10) {
            n = parseInt(s, 16);
          }
          else if (s.length < 18) {
            isBig = true;
            let big_literal = BigInt(s);
            n = parseInt(big_literal & 0xff_ff_ff_ffn);
            n_hi = parseInt(big_literal >> 32n);
          }
          else {
            // if this is a hex value that is more than 8 bytes long, it should be kept as a string
            n = s;
          }

          return {
            type: 'int_literal',
            level: this.level,
            value: n,
            hival: n_hi,
            bigint: isBig,
            result: null,
          }
        }
      },
      bin_literal: {
        // I NEED TO DO SOMETHING ABOUT BIGINT
        match: /0b[01][01_]*/,
        value: s => {
          this.prevLP = false;
          s = s.replaceAll('_', '');
          let n = 0;
          let n_hi = 0;
          let isBig = false;

          if (s.length < 34) {
            n = parseInt(s.replace('0b', ''), 2);
          }
          else if (s.length < 66) {
            isBig = true;
            let big_literal = BigInt(s);
            n = parseInt(big_literal & 0xff_ff_ff_ffn);
            n_hi = parseInt(big_literal >> 32n);
          }
          else {
            n = s;
          }

          return {
            type: 'int_literal',
            level: this.level,
            value: n,
            hival: n_hi,
            bigint: isBig,
            result: null,
          }
        }
      },
      float_literal: {
        match: /[0-9][0-9_]*\.[0-9][0-9_]*/,
        value: s => {
          this.prevLP = false;
          let n = parseFloat(s);
          return {
            level: this.level,
            value: n,
            result: null,
          }
        }
      },
      int_literal: {
        // I NEED TO DO SOMETHING ABOUT BIGINT
        match: /[0-9][0-9_]*/,
        value: s => {
          //let n = parseInt(s.replaceAll('_', ''));
          this.prevLP = false;
          let n = 0;
          let n_hi = 0;
          let isBig = false;
          s = s.replaceAll('_', '');
          let big_literal = BigInt(s);
          if (big_literal.toString(16).length > 8) {
            isBig = true;
            n = parseInt(big_literal & 0xff_ff_ff_ffn);
            n_hi = parseInt(big_literal >> 32n);
          }
          else {
            n = parseInt(s);
          }
          return {
            level: this.level,
            value: n,
            hival: n_hi,
            bigint: isBig,
            result: null,
          }
        }
      },
      name: {
        match: /\$[a-z_A-Z][a-zA-Z_0-9]*/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      terminal: {
        match: /local\.get|global\.get|get_global|get_local|i32\.const|i64\.const|f32\.const|f64\.const|nop|unreachable/,
        value: s => {
          let value = s !== 'get_local' ? s : 'local.get';
          value = value !== 'get_global' ? s : 'global.get';
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: value,
          }
        }
      },
      set: {
        // unary and binary values contain '.' (example i32.eqz) and must be escaped
        match: /local\.set|global\.set/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      load: {
        match: /(?:i32|f32|i64|f64)\.load(?:8|16|32)?(?:_s|_u)?/,
        value: s => {
          let type = typeMap.get(s.slice(0, 3));
          let value = s.slice(8);
          this.prevLP = false;
          return {
            level: this.level,
            result: type,
            value: value,
          }
        }
      },
      store: {
        match: /(?:i32|f32|i64|f64)\.store(?:8|16|32)?/,
        value: s => {
          let type = typeMap.get(s.slice(0, 3));
          let value = s.slice(9);
          this.prevLP = false;
          return {
            level: this.level,
            result: type,
            value: value,
          }
        }
      },
      offset: {
        match: /offset\s*=\s*\d+/,
        value: s => {
          let value = parseInt((s.match(/\d+/) || ['0']).at(0));
          this.prevLP = false;
          return {
            level: this.level,
            value: value,
          }
        }
      },
      align: {
        match: /align\s*=\s*\d+/,
        value: s => {
          let value = parseInt((s.match(/\d+/) || ['0']).at(0));
          this.prevLP = false;
          return {
            level: this.level,
            value: value,
          }
        }
      },
      module_definitions: {
        match: new RegExp(moduleDefinitions.join('|')), // module, func, global, etc.
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      function_definition: {
        match: /param|result|local/,
        value: s => {
          this.prevLP = false;
          let value = 1;
          if (s === 'result') value = 2;
          else if (s === 'local') value = 3;
          return {
            level: this.level,
            result: null,
            value: value,
          }
        }
      },
      call: {
        match: /call|call_indirect/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      attributes: {
        match: /mut|export|import/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      unary: {
        // unary and binary values contain '.' (example i32.eqz) and must be escaped
        match: new RegExp(unaryArray.map(def => escapeRegExp(def.text)).join('|')),
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      binary: {
        // unary and binary values contain '.' (example i32.eqz) and must be escaped
        match: new RegExp(binaryArray.map(def => escapeRegExp(def.text)).join('|')),
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      br: {
        match: /br_if|br/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      begin_block: {
        match: /block|if|loop/, // |switch|select
        value: s => {
          this.level = this.prevLP ? this.level : this.level + 1;
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      then_block: {
        match: /then/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      else_block: {
        match: /else/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
      end_block: {
        match: /end/,
        value: s => {
          this.prevLP = false;
          return {
            level: this.level--,
            result: null,
            value: s,
          }
        }
      },
      valtype: {
        match: new RegExp(Array.from(valtypeMap.keys()).join('|')), // i32, f32, etc.
        value: s => {
          let value = typeMap.get(s);
          this.prevLP = false;
          return {
            level: this.level,
            result: null,
            value: value,
          }
        }
      },
      nl: {
        match: /[\n\r]+/,
        lineBreaks: true,
        value: s => {
          return {
            level: this.level,
            result: null,
            value: s,
          }
        }
      },
    });

    this.lexer.next = (next => () => {
      let tok;
      while ((tok = next.call(this.lexer)) &&
        (tok.type === "comment" || tok.type === "ws" || tok.type === 'nl')
        // I may need to add new lines back in
      ) { }

      if (tok != null) {
        tok.index = this.tokenArray.length;
        tok = Object.assign(tok, tok.value);
        tok.toString = toString.bind(tok);
        return tok;
      }
      return null;
    })(this.lexer.next);

    this.lexer.reset(code);
    let token = this.lexer.next()

    while (token != null) {
      this.tokenArray.push(token);
      token = this.lexer.next();
    }

    this.matchTokens();
    this.findFuncBlock();
    //return TokenArray;

  }

  isBody(token) {
    if (token.type !== 'function_definition' && token.text !== 'export') {
      return true;
    }
    return false;
  }

  findFuncBlock() {
    // THIS IS TOTALLY BUSTED
    for (let i = 0; i < this.tokenArray.length; i++) {
      let token = this.tokenArray[i];
      if (token.text === 'func' && token.level === 2) {
        let func_tok = token;

        for (let j = i + 1; j < this.tokenArray[i - 1].endTokenIndex; j++) {
          let tok = this.tokenArray[j];

          if (tok.type === 'name') {
            continue;
          }
          else if (tok.type === 'lp') {
            if (this.isBody(this.tokenArray[j + 1])) {
              func_tok.bodyStartOffset = j - i;
              break;
            }
            j = tok.endTokenIndex;
          }
          else {
            func_tok.bodyStartOffset = j - i;
            break;
          }
        }
      }
    }
  }

  matchTokens() {
    for (let i = 0; i < this.tokenArray.length; i++) {
      let token = this.tokenArray[i];

      if (token.type === 'lp') {
        this.parenMatchStack.push(token);
      }
      else if (token.type === 'rp') {

        let lpTok = this.parenMatchStack.pop();
        lpTok.endTokenIndex = token.index;
        lpTok.endTokenOffset = token.index - lpTok.index;
        token.beginTokenIndex = lpTok.index;
        token.beginTokenOffset = lpTok.index - token.index;

      }
      else if (token.type === 'begin_block' && this.tokenArray[i - 1].type !== 'lp') {
        this.blockMatchStack.push(token);
      }
      else if (token.type === 'end_block') {
        let beginTok = this.blockMatchStack.pop();
        beginTok.endTokenIndex = token.index;
        beginTok.endTokenOffset = token.index - beginTok.index;
        token.beginTokenIndex = beginTok.index;
        token.beginTokenOffset = beginTok.index - token.index;
      }
      else if (token.type === 'else_block' && this.tokenArray[i - 1].type !== 'lp') {
        let beginTok = this.blockMatchStack.pop();
        if (beginTok == null || beginTok.text !== 'if') {
          logError(`'else' found without matching 'if'`, token);
          return;
        }

        beginTok.endTokenIndex = token.index;
        beginTok.endTokenOffset = token.index - beginTok.index
        token.beginTokenIndex = beginTok.index;
        token.beginTokenOffset = beginTok.index - token.index;

        this.blockMatchStack.push(token);
      }
    }
  }

}

module.exports.Tokenizer = Tokenizer;