import {
  isUndefined, isObject, isArray, isNumber, isString, isBoolean, isDate,
  isFunction, isSymbol, isRegExp, isInteger, isInvalidString, isConstructor,
  hasBuffer, isPlainFunction, toArray
} from './utils';
import {Any} from './types';

export default class TypeDictionary extends Map {

  // names = new Map;
  validators = new Map;

  set(type, ...aliases) {
    if (!isConstructor(type) && isInvalidString(type))
      throw new TypeError('Invalid argument, TypeDictionary.set required constructor');
    if (isPlainFunction(aliases[aliases.length - 1]))
      this.validators.set(type, aliases.pop());
    if (aliases.some(isInvalidString))
      throw new TypeError('Invalid argument, TypeDictionary.set alias required string');

    let name = type.name, lower = name.toLowerCase();
    // this.names.set(type, lower);
    [type, name, lower].concat(aliases).forEach(alias => super.set(alias, type));

    return this
  }

  delete(type) {
    type = super.get(type);
    if (type)
      for (let [key, value] of this)
        if (value === type)
          super.delete(key);
    return this
  }

  /**
   * Compare whether `type`s equality.
   * @param {string|constructor} _type
   * @param {constructor} type
   * @example <caption>ok</caption>
   * // -> true
   * types.equal('string', String) && types.equal('str', String) && types.equal(String, String)
   * @example <caption>not ok</caption>
   * // -> false
   * types.equal('number', String) || types.equal(Number, String) || types.equal('str', 'str')
   * @return {boolean}
   */
  equal(_type, type) {
    return super.get(_type) === type;
  }

  check(types, value) {
    return toArray(types).find(type =>
      this.validators.has(type) ? this.validators.get(type)(value) : (value instanceof type)
    );
  }
}

export const simpleTypeDic = new TypeDictionary()
  .set(Any, '*', (data) => !isUndefined(data))
  .set(Object, 'obj', isObject)
  .set(Array, 'arr', isArray)
  .set(String, 'str', isString)
  .set(Number, 'num', 'float', isNumber)
  // .set('Integer', 'integer', 'int', isInteger)
  .set(Boolean, 'bool', isBoolean)
  .set(Date, 'datetime', isDate)
  .set(Function, 'fun', isFunction)
  .set(Symbol, 'fun', isSymbol)
  .set(RegExp, 'fun', isRegExp);

if (hasBuffer) simpleTypeDic.set(Buffer, 'buff');
