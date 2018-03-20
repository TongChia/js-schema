import {assign, keys, mapValues, includes, toSync,
  isObject, isArray, isUndefined, isFunction} from './utils';
import {simpleTypeDic as types} from './TypeDictionary';
import {validates} from "./ValidateMap";
import {Any, ValidationError} from "./types";

const schemas = new Map();

const normalize = (define) => {

  if (isObject(define))
    return (isArray(define.type) ?
      (define.type.length > 0 && define.type.every(types.has)) :
      (types.has(define.type))) ?
        {...define} :
        {type: Object, properties: {...define}};

  if (isArray(define))
    return (define.length === 0) ?
      {type: Array, items: {type: Any}} :
      (define.length === 1) ?
        {type: Array, items: normalize(define[0])} :
        (define.every(t => types.has(t))) ?
          {type: [...define]} :
          {type: Array, items: [...define]};

  if (types.has(define))
    return {type: define};

};

//TODO: Add $title;
function Schema (define, options) {
  // recursive
  if (!new.target) return new Schema(define, options);

  let formatted =
    (isObject(define)) ?
      (isArray(define.type) ? (define.type.length > 0 && define.type.every(types.has)) : types.has(define.type)) ?
        {...define} :
        {type: Object, properties: mapValues(define, Schema)} :
    (isArray(define)) ?
      (define.length === 0) ?
        {type: Array, items: Schema(Any)} :
      (define.length === 1) ?
        {type: Array, items: Schema(define[0])} :
      (define.every(t => types.has(t))) ?
        {type: [...define]} :
        {type: Array, items: define.map(Schema)} :
    (types.has(define)) ?
      {type: define} : undefined;

  if (!formatted) throw new TypeError('Invalid argument');

  assign(this, formatted);

  if (options && options.freeze) Object.freeze(this);
}

const proto = Schema.prototype;

proto.validateSync = function validateSync (value, force) {
  if (force) return toSync(this.validate)(value);

  let valueType = validates.get('__type').validator(value, this);
  if (!valueType) return false;

  return keys(this)
    .map(attribute => validates.get(attribute, valueType))
    .filter((s) => !(isUndefined(s) || s.async || s.await))
    .every(({validator}) => validator(value, this));
};

proto.validate = function validate (value, callback) {
  if (!isFunction(callback)) return this.validateSync(value, callback);

  // let valueType = validates.get('__type').validator(value, this);
  // if (isUndefined(type)) return callback(new Error('value is undefined'));
  //TODO: async validate;
};

proto.toJSON = function toJSON (version) {
  let type = this.type;
  return assign({}, this, {type: types.name(type)})
};

proto.inspect = function inspect () {
  return `Schema {type: ${types.name(this.type)}}`
};

Schema.Types = types;
Schema.validates = validates;
Schema.schemas = schemas;

export default Schema;
