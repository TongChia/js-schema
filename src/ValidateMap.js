import {
  isObject, isArray, isBoolean, isDate, isNumber, isString, isFunction, isUndefined,
  isAsyncFunction, isInteger, isConstructor, isInvalidString, assign, keys, contains
} from "./utils";
import {Any} from './types';

export default class ValidateMap extends Map {

  set(prop, validate) {
    let conf = {
      async: false,
      message: '${value} is not validated'
    };
    if (isConstructor(prop))
      conf.specified = true;
    else if (isInvalidString(prop))
      throw new TypeError();

    if (isFunction(validate))
      validate = {validator: validate};
    else if (!isObject(validate))
      throw new TypeError();
    else if (!isFunction(validate.validator))
      throw new TypeError();

    super.set(prop, assign(conf, validate));

    return this;
  }

  has(prop) {
    return [].concat(prop).every(p => super.has(p))
  }

  delete(type) {
    type = super.get(type);
    if (type)
      for (let [key, value] of this)
        if (value === type)
          super.delete(key);
    return this
  }
}

export const validates = new ValidateMap()
  .set(String, isString)
  .set(Number, isNumber)
  .set(Boolean, isBoolean)
  .set(Date, isDate)
  .set(Object, isObject)
  .set(Array, isArray)
  .set(Any, (data) => !isUndefined(data))
  .set('enum', (data, _enum) => _enum.includes(data))
  .set('required', (data, required) => (!required && isUndefined(data)))
  .set('min', (data, min) => (data > min))
  .set('max', (data, max) => (data < max))
  .set('match', (data, match) => match.test(data))
  .set('minLength', (data, min) => (data.length > min))
  .set('minLength', (data, max) => (data.length < max))
  .set('integer', (data, integer) => (!integer || isInteger(data)))
  .set('uniq', (data, uniq) => (!uniq || data.every((v, i, d) => d.indexOf(v) === i)))
  .set('type', (data, type) =>
    (validates.has(type) ?
      [].concat(validates.get(type)).some(({validator}) => validator(data)) :
      (data instanceof type))
  )
  .set('properties', (data, properties) =>
    // TODO: check field required.
    // TODO: sub validate callback.
    contains(keys(properties), keys(data)) &&
    keys(properties).every(prop => {
      let sub = properties[prop];
      return properties[prop].validate(data[prop])
    })
  )
  .set('items', (data, items) =>
    isArray(items) ?
      items.every((schema, i) => schema.validate(data[i])) :
      data.every(v => items.validate(v))
  )
;
