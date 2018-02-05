const {isFunction, isString, isSymbol, isInvalidString, isUndefined, isConstructor,
  simpleType, includes, keys, assign, has} = require('./utils');
const {Any, Nil} = require('./types');

const $STORE = Symbol('store');
const $PROPS = Symbol('props');
const $ALIAS = Symbol('alias');

class TypeDictionary {

  [$STORE] = [];
  [$PROPS] = ['symbol', 'name', 'constructor'];
  [$ALIAS] = {};

  constructor (...types) {
    types.forEach(type => this.add(type));
  }

  /**
   * Add Type
   * @param Type
   * @param aliases {string?}
   * @return {TypeDictionary}
   */
  add(Type, ...aliases) {
    let symbol, name, lowercase, constructor, toJSON = () => lowercase, outset = this[$STORE].length,
      description = {enumerable: false, configurable: false, writable: false};

    if (isString(Type) && !Type.trim()) name = Type;
    else if (isConstructor(Type)) {constructor = Type; name = Type.name;}
    else throw TypeError(`invalid arguments (${Type})`);

    if (aliases.some(alias => isInvalidString(alias)))
      throw TypeError(`invalid arguments (${aliases.find(alias => !isInvalidString(alias))})`);

    name      = name.trim();
    symbol    = Symbol.for(name);
    lowercase = name.toLowerCase();

    if (this.has(symbol, name, lowercase, Type, ...aliases)) throw Error(`Already has type (${name})`);


    // mark the Type;
    if (constructor) {
      Object.defineProperty(Type.prototype, 'class', assign(description, {value: Type}));
      // Object.defineProperty(Type, 'sign', assign(description, {value: symbol}));
      if (constructor.toJSON)
        aliases.push(constructor.toJSON());
      else
        Object.defineProperty(Type, 'toJSON', assign(description, {value: toJSON}));
    }
    aliases.concat([name, lowercase]).forEach(alias => this[$ALIAS][alias] = symbol);
    this[$STORE][outset + this[$PROPS].indexOf('symbol')]      = symbol;
    this[$STORE][outset + this[$PROPS].indexOf('name')]        = name;
    this[$STORE][outset + this[$PROPS].indexOf('constructor')] = constructor;

    return this;
  }

  /**
   * get type
   * @param type
   * @return {object}
   */
  get(type) {
    let i = this.indexOf(type), l = this[$PROPS].length;
    return i >= 0 ? this[$STORE][i * l + this[$PROPS].indexOf('constructor')] : undefined
  }

  delete(type) {
    if (!this.has(type)) return this;
    let l = this[$PROPS].length, start = this.indexOf(type) * l, end = start + l, s = this.symbol(type);
    this[$STORE] = this[$STORE].slice(0, start).concat(this[$STORE].slice(end));
    for (let k in this[$ALIAS]) {
      if (this[$ALIAS].hasOwnProperty(k) && this[$ALIAS][k] === s)
        delete this[$ALIAS][k];
    }
    return this;
  }

  indexOf(type) {
    let l = this[$PROPS].length, s = this[$ALIAS][type], i = this[$STORE].indexOf(s || type);
    return Math.floor(i / l);
  }

  symbol(type) {
    let i = this.indexOf(type);
    return i >= 0 ? this[$STORE][i + this[$PROPS].indexOf('symbol')] : undefined;
  }

  equal(a, b) {
    let i = this.indexOf(a);
    return i >= 0 && i === this.indexOf(b);
  }

  /**
   * check type
   * @param type
   * @param others
   * @return {boolean}
   */
  has(type, ...others) {
    if (others.length) return this.has(...others);
    return includes(this[$STORE], type) || has(this[$ALIAS], type);
  }

  get length () {
    return Math.ceil(this[$STORE].length / this[$PROPS].length);
  }

}

const simpleTypeDic = new TypeDictionary(Object, Array, Number, String, Boolean, Date, Function, Any, Nil);

module.exports = TypeDictionary;
module.exports.simpleTypeDic = simpleTypeDic;
