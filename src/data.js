const { logError, dataTable, WasmModule } = require("./shared");

class Data {
  constructor(tokenArray) {
    for (let i = 0; i < tokenArray.length; i++) {
      let token = tokenArray[i];

      if (token.type === 'lp') {
        // this.subExpression(tokenArray.slice(i + 1, i + token.endTokenOffset));
        // i += token.endTokenOffset;
        let nextToken = tokenArray[i + 1];
        if (nextToken.text !== 'i32.const') {
          logError(`expected to find 'i32.const', instead found '${nextToken.text}'`, nextToken);
          return;
        }
        let intLiteralToken = tokenArray[i + 2];

        if (intLiteralToken.type !== 'int_literal') {
          logError(`expected int literal, instead found '${intLiteralToken.type}'`, intLiteralToken);
          return;
        }
        this.jsOffset = intLiteralToken.value;
        i += token.endTokenOffset;
      }
      else if (token.type === 'name') {
        this.globalName = token.text;
      }
      else if (token.type === 'string_literal') {
        this.jsData = token.value;
      }
    }
    this.init();
    dataTable.push(this);
  }

  init(moduleOffset = 0) {
    // data is a string, offset is a js number
    this.moduleOffset = moduleOffset;

    // i think I need to go from an array to a Uint8Array
    if (this.jsData.slice(0, 3) === '\\0x') {
      this.dataArray = this.parseHexNumber(this.jsData.slice(4));
    }
    else {
      this.dataArray = this.parseStringData(this.jsData);
    }
    // when I get internet back on I cal look into how to convert a string into Uint8Array
    this.data = new Uint8Array(this.dataArray);
    // If I want to include modules I need to offset data
    this.offset = WasmModule.i32.const(this.jsOffset + this.moduleOffset);
  }

  parseHexNumber(hex_string) {
    let hexString = hex_string.replaceAll('_', '');
    let intArray = [];
    while (hexString.length > 0) {
      let hexNumString = hexString.slice(0, 2);
      let intNum = parseInt(hexNumString, 16);
      intArray.push(intNum);
      hexString = hexString.slice(2);
    }
    return intArray;
  }

  parseStringData(data_string) {
    let intArray = [];
    while (data_string.length > 0) {
      if (data_string.charAt(0) === '\\') {
        let hexNumString = data_string.slice(1, 3);
        let intNum = parseInt(hexNumString, 16);
        intArray.push(intNum);
        data_string = data_string.slice(3);
      }
      else {
        let intNum = data_string.charCodeAt(0);
        intArray.push(intNum);
        data_string = data_string.slice(1);
      }
    }
    return intArray;
  }
}

module.exports.Data = Data;