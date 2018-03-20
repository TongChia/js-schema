import {isInvalidString, isConstructor, isArray, hasBuffer} from './utils';
import {Any} from './types';

export default class TypeDictionary extends Map {

  names = new Map;

  constructor(...args) {
    super();

    args.forEach(arg => this.add(arg))
  }

  add(type, ...aliases) {
    if (!isConstructor(type))
      throw new TypeError('Invalid argument, TypeDictionary.add required constructor');
    if (aliases.some(isInvalidString))
      throw new TypeError('Invalid argument, TypeDictionary.add alias required string');

    let name = type.name, lower = name.toLowerCase();
    this.names.set(type, aliases[0] || lower);
    [type, name, lower].concat(aliases).forEach(alias => super.set(alias, type));

    return this
  }

  has(type) {
    return [].concat(type).every(t => super.has(t))
  }

  delete(type) {
    type = super.get(type);
    if (type)
      for (let [key, value] of this)
        if (value === type)
          super.delete(key);
    return this
  }

  get(type) {
    return isArray(type) ? type.map(t => super.get(t)) : super.get(type);
  }

  equal($type, type) {
    return super.get($type) === type;
  }

  name(type) {
    // TODO: optimize ↓
    return isArray(type) ?
      this.get(type).map(t => this.names.get(t)) :
      this.names.get(this.get(type));
  }
}

export const simpleTypeDic = new TypeDictionary(
  Object, Array, Number, String, Boolean, Date, Function
).add(Any, '*');

if (hasBuffer) simpleTypeDic.add(Buffer);
