"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simpleTypeDic = exports.default = void 0;

var _utils = require("./utils");

var _types = require("./types");

class TypeDictionary extends Map {
  constructor(...args) {
    super();
    Object.defineProperty(this, "names", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: new Map()
    });
    args.forEach(arg => this.add(arg));
  }

  add(type, ...aliases) {
    if (!(0, _utils.isConstructor)(type)) throw new TypeError('Invalid argument, TypeDictionary.add required constructor');
    if (aliases.some(_utils.isInvalidString)) throw new TypeError('Invalid argument, TypeDictionary.add alias required string');
    let name = type.name,
        lower = name.toLowerCase();
    this.names.set(type, aliases[0] || lower);
    [type, name, lower].concat(aliases).forEach(alias => super.set(alias, type));
    return this;
  }

  has(type) {
    return [].concat(type).every(t => super.has(t));
  }

  delete(type) {
    type = super.get(type);
    if (type) for (let [key, value] of this) if (value === type) super.delete(key);
    return this;
  }

  get(type) {
    if ((0, _utils.isArray)(type)) return type.map(t => super.get(t));
    return super.get(type);
  }

  name(type) {
    if ((0, _utils.isArray)(type)) return this.get(type).map(t => this.names.get(t));
    return this.names.get(this.get(type));
  }

}

exports.default = TypeDictionary;
const simpleTypeDic = new TypeDictionary(Object, Array, Number, String, Boolean, Date, Function).add(_types.Any, '*');
exports.simpleTypeDic = simpleTypeDic;
if ('undefined' !== typeof Buffer) simpleTypeDic.add(Buffer);