"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = _interopRequireDefault(require("./utils"));

var _TypeDictionary = require("./TypeDictionary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Schema {
  constructor(define) {
    if (!new.target) return new Schema(define);
    if (_utils.default.isArray(define)) return Error('not support yet');
    if (!_utils.default.isObject(define)) return new Schema({
      type: define
    });
    if (Schema.Types.has(define.type)) _utils.default.assign(this, define, {
      type: Schema.Types.get(define.type)
    });else throw TypeError();
  }

}

exports.default = Schema;
Schema.Types = _TypeDictionary.simpleTypeDic;