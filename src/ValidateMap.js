import {
  isUndefined, isBoolean, isString, isSymbol, isRegExp, isObject,
  isArray, isFunction, isInteger, isAsyncFunction, isConstructor,
  isInvalidString, assign, keys, contains, toArray, different, template, isError
} from "./utils";
import {Any, ValidationError} from './types';

export default class ValidateMap extends Map {

  scopes = new Map;

  /**
   * Set `validate`.
   * @param {String} prop
   * @param {(Object|Function)} validate
   * @param [scope]
   * @return {ValidateMap}
   */
  set(prop, validate, scope) {
    let scopes = toArray(scope)
      , {validator = validate, message = '${value} is not validated', error = ValidationError} = validate
      , _async = validate.async
      , _await = validate.await;

    if (isInvalidString(prop))
      throw new TypeError(`Invalid argument (${prop})`);
    if (!isFunction(validator))
      throw new TypeError(`Invalid argument (${validator})`);

    if (isAsyncFunction(validator)) _await = true;
    if (/^async /.test(prop)) _async = !_await;
    else if (_async || _await) prop = 'async ' + prop;

    super.set(prop, {async: _async, await: _await, validator, message, error});

    if (scopes.length && scopes.every(isConstructor))
      this.scopes.set(prop, scopes);

    return this;
  }

  has(keyword, scope) {
    return (!this.scopes.has(keyword) || this.scopes.get(keyword).includes(scope)) && super.has(keyword)
  }
}

export const validates = new ValidateMap()
  .set('enum', (data, schema) => schema.enum.includes(data))
  .set('min', (data, {min}) => (data >= min), Number)
  .set('max', (data, {max}) => (data <= max), Number)
  .set('match', (data, {match}) => match.test(data), String)
  .set('minLength', (data, {min}) => (data.length >= min), String)
  .set('maxLength', (data, {max}) => (data.length <= max), String)
  .set('minItems', (data, {min}) => (data.length >= min), Array)
  .set('maxItems', (data, {max}) => (data.length <= max), Array)
  .set('integer', (data, {integer}) => (!integer || isInteger(data)), Number)
  .set('uniq', (data, {uniq}) => (!uniq || data.every((v, i, d) => d.indexOf(v) === i)), Array)
  .set('before', (data, {before}) => (new Date(data) < new Date(before)), Date)
  .set('after', (data, {after}) => (new Date(data) > new Date(after)), Date)
  // .set('required', (data, {required}) => (!required && isUndefined(data)))
  .set('properties', async (data, {properties}) => {
    let props = keys(properties);
    let _keys = keys(data);

    let extra = different(props, _keys);

    if (extra.length) return new ValidationError('extra' + extra);

    for (let prop of props) {
      let _schema = properties[prop], _data = data[prop], result;
      if (isUndefined(_data) && _schema.required) throw new ValidationError('Undefined');
      result = await _schema.validateWait(_data);
      if (isError(result)) throw result;
      data[prop] = result;
    }

    return data;
  }, Object)
  .set('properties', (data, {properties}) => {
    let props = keys(properties);
    let _keys = keys(data);

    return contains(props, _keys) && props.every(prop => {
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
