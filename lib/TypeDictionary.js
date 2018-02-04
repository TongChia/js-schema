const {
  isFunction,
  isString,
  isSymbol,
  isNil,
  isArray,
  simpleType,
  includes,
  isConstructor
} = require('./utils');

const {
  Any,
  Nil
} = require('./types');

const $STORE = Symbol('type store');
const $PROPS = Symbol('type props');
const $NONE = Symbol('none');
var _$STORE = $STORE;
var _$PROPS = $PROPS;

class TypeDictionary {
  constructor(types = []) {
    Object.defineProperty(this, _$STORE, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, _$PROPS, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: ['symbol', 'name', 'constructor']
    });
    types.forEach(type => this.add(type));
  }
  /**
   * add type;
   * @param type {function}
   * @param name {string?}
   * @param symbol {symbol?}
   * @return {TypeDictionary}
   */


  add(type, {
    name,
    symbol
  } = {}) {
    if (!isFunction(type)) throw TypeError('TypeDictionary.add required param constructor:Function, not ' + simpleType(type));
    return this.append(symbol, name || type.name, type);
  }
  /**
   * add type
   * @param symbol {symbol}
   * @param name {string}
   * @param constructor {function|symbol}
   * @return {TypeDictionary}
   */


  append(symbol, name, constructor = $NONE) {
    if (isNil(name)) name = constructor.name;
    if (!isString(name)) throw TypeError('TypeDictionary.append required param name:String, not ' + simpleType(name));else name = name.toLowerCase();
    if (isNil(symbol)) symbol = Symbol(name);
    if (!isSymbol(symbol)) throw TypeError('TypeDictionary.append required param symbol:Symbol, not ' + simpleType(symbol));
    if ($NONE !== constructor && null !== constructor && !isFunction(constructor)) throw TypeError('TypeDictionary.append required param constructor:Function, not ' + simpleType(symbol));
    if (this.has(symbol) || this.has(name) || this.has(constructor) && $NONE !== constructor) throw Error('TypeDictionary.append error: Already has this type ' + name);
    let outset = this[$STORE].length;
    this[$STORE][outset + this[$PROPS].indexOf('symbol')] = symbol;
    this[$STORE][outset + this[$PROPS].indexOf('name')] = name;
    this[$STORE][outset + this[$PROPS].indexOf('constructor')] = constructor;
    return this;
  }

  push(Type) {
    assert(isConstructor(Type));
  }
  /**
   * set type
   * @param symbol {symbol}
   * @param name {string}
   * @param constructor {function?}
   * @return {TypeDictionary}
   */


  set(symbol, name, constructor) {
    if (isNil(symbol)) throw TypeError('TypeDictionary.set required param symbol:Symbol, not ' + simpleType(symbol));
    if (!this.has(symbol)) return this.append(symbol, name, constructor);
    let outset = this[$STORE].indexOf(symbol) - this[$PROPS].indexOf('symbol');
    if (!isNil(name)) if (!isString(name)) throw TypeError('TypeDictionary.set required param name:String, not ' + simpleType(name));else if (this.has(name) && !this.equal(symbol, name)) throw Error(`Duplicate name detected, name \`${name}\` already used.`);else this[$STORE][outset + this[$PROPS].indexOf('name')] = name.toLowerCase();
    if (!isNil(constructor)) if (!isFunction(constructor) || $NONE === constructor) throw TypeError('TypeDictionary.set required param constructor:Function, not ' + simpleType(name));else if (this.has(constructor) && !this.equal(symbol, constructor) && $NONE !== constructor) throw Error(`Duplicate constructor detected, constructor \`${constructor.name || this.get(constructor).name}\` already exists`);else this[$STORE][outset + this[$PROPS].indexOf('constructor')] = constructor;
    return this;
  }
  /**
   * get type
   * @param type
   * @return {object}
   */


  get(type) {
    let outset = this[$STORE].indexOf(type) - this[$STORE].indexOf(type) % this[$PROPS].length;
    return this.has(type) ? this[$PROPS].reduce((O, p, i) => {
      O[p] = this[$STORE][outset + i];
      return O;
    }, {}) : undefined;
  }

  indexOf(type) {
    let i = this[$STORE].indexOf(type),
        l = this[$PROPS].length;
    return (i - i % l) / l;
  }

  equal(a, b) {
    return this.indexOf(a) === this.indexOf(b);
  }
  /**
   * get type symbol
   * @param type {symbol|string|function}
   * @return {symbol|undefined}
   */


  symbol(type) {
    if (isArray(type)) return type.map(t => this.symbol(t));
    let outset = this[$STORE].indexOf(type) - this[$STORE].indexOf(type) % this[$PROPS].length;
    return this.has(type) ? this[$STORE][outset + this[$PROPS].indexOf('symbol')] : undefined;
  }

  get key() {
    return this.symbol;
  }

  name(type) {
    let outset = this[$STORE].indexOf(type) - this[$STORE].indexOf(type) % this[$PROPS].length;
    return this.has(type) ? this[$STORE][outset + this[$PROPS].indexOf('name')] : undefined;
  }
  /**
   * check type
   * @param v
   * @return {boolean}
   */


  has(v) {
    if (isArray(v)) return v.every(type => this.has(type));
    return includes(this[$STORE], v.toLowerCase ? v.toLowerCase() : v);
  }

  get length() {
    return this[$STORE].length / this[$PROPS].length;
  }

  get symbols() {
    let symbols = [];

    while (symbols.length < this.length) {
      symbols[symbols.length] = this[$STORE][symbols.length * this[$PROPS].length];
    }

    return symbols;
  }

  get keys() {
    return this.symbols;
  }

}

const simpleTypeDic = new TypeDictionary([Object, Array, Number, String, Boolean, Date, Function]);
simpleTypeDic.append(Symbol('any'), 'any', Any);
simpleTypeDic.append(Symbol('null'), 'null');
module.exports = TypeDictionary;
module.exports.simpleTypeDic = simpleTypeDic;
module.exports.$NONE = $NONE; //TODO: alias name
//TODO: `add` `set` `append`