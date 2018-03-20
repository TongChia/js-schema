import {
  isUndefined, isBoolean, isDate, isString, isSymbol, isRegExp, isObject,
  isArray, isFunction, isInteger, isNumber, isAsyncFunction, isConstructor,
  isInvalidString, assign, keys, contains, toArray
} from "./utils";
import {Any, ValidationError} from './types';

export default class ValidateMap extends Map {

  scopes = new Map;

  /**
   * Set `validate`.
   * @param {(String|*)} prop
   * @param {(Object|Function)} validate
   * @param {(Array|*)} [scopes]
   * @param {Boolean} [isAsync]
   * @return {ValidateMap}
   */
  set(prop, validate, scopes, isAsync) {
    let conf = {async: false, message: '${value} is not validated'};

    if (isConstructor(scopes)) scopes = [scopes];
    if (isArray(scopes) && scopes.every(isConstructor)) this.scopes.set(prop, scopes);

    if (isConstructor(prop))
      conf.specified = prop;
    else if (isInvalidString(prop))
      throw new TypeError(`Invalid argument (${prop})`);

    if (isFunction(validate))
      validate = {validator: validate};
    else if (!isObject(validate))
      throw new TypeError(`Invalid argument (${validate})`);
    else if (!isFunction(validate.validator))
      throw new TypeError(`Invalid argument (${validate.validator})`);

    if (isAsyncFunction(validate.validator)) conf.await = true;

    super.set(prop, assign(conf, validate));

    return this;
  }

  get(attribute, type) {
    if (!this.scopes.has(attribute) || this.scopes.get(attribute).includes(type))
      return super.get(attribute);
  }
}

export const validates = new ValidateMap()
  .set(String, isString)
  .set(Number, isNumber)
  .set(Boolean, isBoolean)
  .set(Date, isDate)
  .set(Object, isObject)
  .set(Array, isArray)
  .set(Symbol, isSymbol)
  .set(RegExp, isRegExp)
  .set(Any, (data) => !isUndefined(data))
  .set('enum', (data, schema) => schema.enum.includes(data))
  .set('min', (data, {min}) => (data >= min), Number)
  .set('max', (data, {max}) => (data <= max), Number)
  .set('match', (data, {match}) => match.test(data), String)
  .set('minLength', (data, {min}) => (data.length > min), String)
  .set('maxLength', (data, {max}) => (data.length < max), String)
  .set('minItems', (data, {min}) => (data.length > min), Array)
  .set('maxItems', (data, {max}) => (data.length < max), Array)
  .set('integer', (data, {integer}) => (!integer || isInteger(data)), Number)
  .set('uniq', (data, {uniq}) => (!uniq || data.every((v, i, d) => d.indexOf(v) === i)), Array)
  .set('before', (data, {before}) => (new Date(data) < new Date(before)), Date)
  .set('after', (data, {after}) => (new Date(data) > new Date(after)), Date)

  // check type first.
  .set('__type', (data, {type}) =>
    toArray(type).find(t =>
      validates.has(t) ? validates.get(t).validator(data) : (data instanceof t)
    )
  )
  // .set('required', (data, {required}) => (!required && isUndefined(data)))
  .set('$properties', () => {
    // TODO: check properties with callback
  })
  .set('properties', (data, {properties}) => {
    let _props = keys(properties);
    let _keys = keys(data);

    return contains(_props, _keys) && _props.every(prop => {
      let _schema = properties[prop];
      let _data = data[prop];
      if (isUndefined(_data) && !_schema.required)
        return true;
      return _schema.validate(_data);
    });
  }, Object)
  .set('items', (data, {items}) => isArray(items) ?
    items.every((schema, i) => schema.validate(data[i])) :
    data.every(v => items.validate(v)),
    Array
  )
;
