const { TokenArray } = require("./shared.js");
const binaryen = require("binaryen");
const moo = require("moo");
var level = 0;
var index = 0;

/*
*/

const lexer = moo.compile({
  ws: /[ \t]+/,
  lp: {
    match: /\(/,
    value: s => {
      return {
        level: ++level,
        index: index++,
        result: null,
        value: s,
      }
    }
  },
  rp: {
    match: /\)/,
    value: s => {
      return {
        level: level--,
        index: index++,
        result: null,
        value: s,
      }
    }
  },
  comment: {
    match: /;;[^\n]*/,
    value: s => s.substring(1)
  },
  comma: ",",
  lbracket: "[",
  rbracket: "]",
  string_literal: {
    match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/,
    value: s => {
      return {
        level: level,
        index: index++,
        value: JSON.parse(s),
        result: null,
      }
    }
  },
  hex_literal: {
    // I NEED TO DO SOMETHING ABOUT BIGINT
    match: /0x[0-9a-fA-F][0-9a-fA-F_]*/,
    value: s => {
      s = s.replaceAll('_', '');
      let n = 0;
      let n_hi = 0;
      let isBig = false;
      if (s.length < 10) {
        n = parseInt(s, 16);
      }
      else {
        isBig = true;
        let big_literal = BigInt(s);
        n = parseInt(big_literal & 0xff_ff_ff_ffn);
        n_hi = parseInt(big_literal >> 32n);
      }

      return {
        type: 'int_literal',
        level: level,
        index: index++,
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
      s = s.replaceAll('_', '');
      let n = 0;
      let n_hi = 0;
      let isBig = false;

      if (s.length < 34) {
        n = parseInt(s.replace('0b', ''), 2);
      }
      else {
        isBig = true;
        let big_literal = BigInt(s);
        n = parseInt(big_literal & 0xff_ff_ff_ffn);
        n_hi = parseInt(big_literal >> 32n);
      }


      return {
        type: 'int_literal',
        level: level,
        index: index++,
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
      let n = parseFloat(s);
      return {
        level: level,
        index: index++,
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
        level: level,
        index: index++,
        value: n,
        hival: n_hi,
        bigint: isBig,
        result: null,
      }
    }
  },
  name: {
    match: /\$[a-z_][a-z_0-9]*/,
    value: s => {
      return {
        level: level,
        index: index++,
        result: null,
        value: s,
      }
    }
  },
  terminal: {
    match: /global\.get|local\.get|i32\.const|f32\.const|i64\.const|f64\.const|nop|unreachable/,
    value: s => {
      return {
        level: level,
        index: index++,
        result: null,
        value: s,
      }
    }
  },
  global_level: {
    match: /module|func|type|import|export|table|funcref|elem|global|memory/,
    value: s => {
      return {
        level: level,
        index: index++,
        result: null,
        value: s,
      }
    }
  },
  sig: {
    match: /param|result|local/,
    value: s => {
      return {
        level: level,
        index: index++,
        result: null,
        value: s,
      }
    }
  },
  control: {
    match: /block|if|else|end|then|loop|br_if|br|switch|return|select/,
    value: s => {
      return {
        level: level,
        index: index++,
        result: null,
        value: s,
      }
    }
  },
  unary: {
    match: /i32.clz|i32.ctz|i32.popcnt|i32.eqz/,
    value: s => {
      // i could check the first 3 characters for btype here
      // the type the function consumes may require a lookup
      return {
        level: level,
        index: index++,
        result: binaryen.i32,
        consumes: [binaryen.i32],
        value: s,
      }
    }
  },
  binary: {
    match: /i32.add|i32.sub|i32.mul|i32.and/,
    value: s => {
      // i could check the first 3 characters for btype here
      // the types the function consumes may require a lookup
      return {
        level: level,
        index: index++,
        result: binaryen.i32,
        consumes: [binaryen.i32, binaryen.i32],
        value: s,
      }
    }
  },
  type: {
    match: /i32|i64|f32|f64/,
    value: s => {
      let btype = binaryen.none;
      if (s === 'i32') {
        btype = binaryen.i32;
      }
      else if (s === 'f32') {
        btype = binaryen.f32;
      }
      else if (s === 'i64') {
        btype = binaryen.i64;
      }
      else if (s === 'f64') {
        btype = binaryen.f64;
      }
      return {
        level: level,
        index: index++,
        btype: btype,
        result: null,
        value: s,
      }
    }
  },
  nl: {
    match: /[\n\r]+/,
    lineBreaks: true,
    value: s => {
      return {
        level: level,
        index: index++,
        result: null,
        value: s,
      }
    }
  },
});

lexer.next = (next => () => {
  let tok;
  while ((tok = next.call(lexer)) &&
    (tok.type === "comment" || tok.type === "ws")
  ) { }
  return tok;
})(lexer.next);

module.exports.tokenize = function tokenize(code) {
  // multiline comments were throwing off moo.js.  I removed them here.
  let comment_array = code.match(/\(;(?:(\n)|[^\n])*?;\)/gm) || [];
  for (let i = 0; i < comment_array.length; i++) {
    let comment = comment_array[i];
    let white_space = comment.match(/\s/gm);
    code = code.replace(comment, white_space.join(''));
  }

  lexer.reset(code);
  let token = lexer.next();

  // one token look ahead
  while (token != null) {
    token.children = [];
    token.attributes = [];
    let push_tok = Object.assign(token, token.value);
    //delete push_tok.value;
    TokenArray.push(push_tok);
    token = lexer.next();
  }
  //console.log(TokenArray);
  return TokenArray;
}
