import {assign, keys, mapValues, toArray, toAwait, toSync, simpleType, isError,
  isInvalidString, isObject, isArray, isUndefined, isFunction, template} from './utils';
import {simpleTypeDic as types} from './TypeDictionary';
import {validates} from "./ValidateMap";
import {Any, ValidationError} from "./types";

const schemas = new Map();
const plugins = new Map();

function Schema (title, desc, options) {
  // recursive
  if (!new.target) return new Schema(title, desc, options);

  if (isInvalidString(title) || types.has(title)) {
    options = desc || {};
    desc = title || Any;
  } else {
    desc = desc || Any;
    options = options || {};
    schemas.set(title, this);
    this.$title = title;
  }

  let formatted = this.fromJS(desc) || this.fromJSON(desc);

  if (!formatted) throw new TypeError(`Invalid argument (${desc})`);

  assign(this, formatted);

  if (options.freeze) Object.freeze(this);
}

const proto = Schema.prototype;

proto.fromJS = function (desc) {
  return isObject(desc) ?
    // Single type
    // ex: Schema({type: String})
    types.has(desc.type) ?
      {...desc, type: types.get(desc.type)} :
      // Multiple types
      // ex: Schema({type: [String, Number]})
      (isArray(desc.type) && desc.type.length > 0 && desc.type.every(types.has)) ?
        {...desc, type: desc.type.map(types.get)} :
        // no type description, ex: Schema({foo: String, bar: Number})
        {type: Object, properties: mapValues(desc, Schema)} :
    isArray(desc) ?
      (desc.length > 1) ?
        // Tuple
        // ex: Schema([String, Number]) | Schema([{type: String, format: 'uuid'}, Buffer])
        {type: Array, items: desc.map(Schema)} :
        // Array
        // ex: Schema([String]) | Schema([{type: Buffer, ...}]) | Schema([]);
        // ex: Schema([{type: [String, Number]}]) | Schema([{type: [String, ObjectID]}])
        {type: Array, items: Schema(desc[0])} :
      types.has(desc) ?
        // ex: Schema(String)
        {type: types.get(desc)} :
        undefined;
};

proto.fromJSON = function (desc, version) {
  //TODO: parse json-schema
};

/**
 * Check if `schema.type` contains the type of `value`.
 * @param value
 * @return {undefined|T}
 */
proto.checkType = function (value) {
  return toArray(this.type).find(type => types.validators.has(type) ?
    types.validators.get(type)(value) : (value instanceof type));
};

proto.validates = function (type, withAsync) {
  return keys(this).reduce((map, key) => {
    if (withAsync && validates.has('async ' + key, type)) {
      map.set(key, validates.get('async ' + key))
    } else if (validates.has(key, type)) {
      map.set(key, validates.get(key))
    }
    return map;
  }, new Map)
};

proto.validateSync = function (value, force) {
  if (force) return toSync(this.validate)(value);

  let valueType = this.checkType(value);
  if (!valueType) return false;

  for (let [attribute, {validator, error, message}] of this.validates(valueType))
    if (!validator(value, this))
      return force === 'error' ?
        new error(message, {value, attribute}) : false;
  return true;
};

proto.validateWait = async function (value) {
  let valueType = this.checkType(value);
  if (!valueType) throw new TypeError();
  // TODO: return false or throw Error;

  for (let [attribute, {validator, message, error, ...v}] of this.validates(valueType, true)) {
    let result =  await (v.async ? toAwait(validator) : validator)(value, this);
    if (!result) throw new error(template(message, {attribute, value}));
    if (isError(result)) throw result;
  }

  return true;
};

proto.validate = function (value, callback) {
  if (!isFunction(callback)) return this.validateSync(value, callback);

  return this.validateWait(value)
    .then(result => callback(null, result))
    .catch(err => callback(err));
};

proto.toJSON = function (version) {
  //TODO: to json-schema format;
  let type = this.type;
  return assign({}, this, {type: types.name(type)})
};

proto.inspect = function () {
  return `Schema${this.$title ? ' ' + this.$title : ''} {type: ${this.type.name}}`
};

Schema.Types = types;
Schema.validates = validates;
Schema.schemas = schemas;
Schema.plugins = plugins;

export default Schema;
