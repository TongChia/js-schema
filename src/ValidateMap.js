import {
  isUndefined, isBoolean, isString, isSymbol, isRegExp, isObject,
  isArray, isFunction, isInteger, isAsyncFunction, isConstructor,
  isInvalidString, assign, keys, toArray, isError, entries, isAwait
} from "./utils";
import {Any, ValidationError} from './types';

export default class ValidateMap extends Map {

  scopes = new Map;

  /**
   * Set `validate`.
   * @param {String} prop
   * @param {(Object|Function)} validate
   * @param {Function} validate.validator
   * Data valid check method,
   * if not valid, return false like or throw errors.
   * @param [scope]
   * @return {ValidateMap}
   */
  set(prop, validate, scope) {
    let scopes = toArray(scope)
      , {validator = validate, message = '${value} is not validated', error = ValidationError} = validate
      , _async = validate.async;

    if (isInvalidString(prop))
      throw new TypeError(`Invalid argument (${prop})`);
    if (!isFunction(validator))
      throw new TypeError(`Invalid argument (${validator})`);

    super.set(prop, {async: _async, validator, message, error});

    if (scopes.length && scopes.every(isConstructor))
      this.scopes.set(prop, scopes);
  }

  has(keyword, scope) {
    return isArray(scope) ? scope.every(s => this.has(s)) :
      (!this.scopes.has(keyword) || this.scopes.get(keyword).includes(scope)) && super.has(keyword)
  }

  getVerifies(schema, type) {
    type = type || schema.type;
    keys(schema).reduce((result, key) => {
      if (!isUndefined(schema[key]) && this.has(key, type))
        result.push([key, this.get(key)]);
      return result;
    }, [])
  }
}

const _ = new ValidateMap();
_.set('enum', (data, schema) => schema.enum.includes(data));
_.set('min', (data, {min}) => (data >= min), Number);
_.set('max', (data, {max}) => (data <= max), Number);
_.set('match', (data, {match}) => match.test(data), String);
_.set('minLength', (data, {minLength}) => (data.length >= minLength), String);
_.set('maxLength', (data, {maxLength}) => (data.length <= maxLength), String);
_.set('minItems', (data, {minItems}) => (data.length >= minItems), Array);
_.set('maxItems', (data, {maxItems}) => (data.length <= maxItems), Array);
_.set('integer', (data, {integer}) => (!integer || isInteger(data)), Number);
_.set('unique', (data, {unique}) => (!unique || data.every((v, i, d) => d.indexOf(v) === i)), Array);
_.set('before', (data, {before}) => (new Date(data) < new Date(before)), Date);
_.set('after', (data, {after}) => (new Date(data) > new Date(after)), Date);
_.set('items', (data, {items}) => {
  let waiting = [];
  let finish = async () => {
    for (let [index, promise] of waiting) {
      let error = await promise;
      if (isError(error)) throw assign(error, {index});
    }
    return true;
  };

  if (isArray(items)) {
    for (let [index, schema] of items) {
      if (isUndefined(data[index])) {
        if (schema.required)
          throw new ValidationError(`Index '${index}' is required.`, {index: index});
      } else {
        let result = schema.validate(data[index]);
        if (isAwait(result)) waiting.push([index, result]);
        if (isError(result)) throw assign(result, {index});
      }
    }
  } else {
    for (let i = 0; i < data.length; i++) {
      let result = items.validate(data[index]);
      if (isAwait(result)) waiting.push([index, result]);
      if (isError(result)) throw assign(result, {index});
    }
  }

  if (waiting.length)
    return {then: (success, filed) => finish().then(success, filed)};

  return true;
}, Array);
_.set('properties', (data, {properties}) => {
  let waiting = [];
  let finish = async () => {
    for (let [path, promise] of waiting) {
      let error = await promise;
      if (isError(error)) throw assign(error, {path});
    }
    return true;
  };

  for (let [path, schema] of entries(properties)) {
    if (isUndefined(data[path])) {
      if (schema.required)
        return new ValidationError(`Path '${path}' is required.`, {path});
    } else {
      let result = schema.validate(data[path]);
      if (isAwait(result)) waiting.push([path, result]);
      if (isError(result)) throw assign(result, {path});
    }
  }

  if (waiting.length)
    return {then: (success, filed) => finish().then(success, filed)};

  return true;
}, Object);

export const validates = _;
