import {assign, keys, mapValues, toSync, isError, isInvalidString, toArray, isAwait,
  isObject, isArray, isUndefined, isAsyncFunction, template, toAwait} from './utils';
import {simpleTypeDic as types} from './TypeDictionary';
import {validates} from "./ValidateMap";
import {Any} from "./types";

const schemas = new Map();

// TODO: on validate hook (before / after);
const plugins = new Map();

function Schema (title, desc, options) {
  // recursive
  if (!new.target) return new Schema(title, desc, options);

  // TODO: optimize ↓
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

  let formatted =
    isObject(desc) ?
      // Single type
      // ex: Schema({type: String})
      types.has(desc.type) ?
        {...desc, type: types.get(desc.type)} :
        // Multiple types
        // ex: Schema({type: [String, Number]})
        (isArray(desc.type) && desc.type.length > 0 && desc.type.every(types.has)) ?
          {...desc, type: desc.type.map(types.get)} :
          // no type description, ex: Schema({foo: String, bar: Number})
          {type: Object, properties: desc} :
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

  if (!formatted) return;
  // if (formatted.type === Object && !formatted.properties) return;
  if (formatted.type === Array && !formatted.items) formatted.items = Schema(Any);
  if (formatted.properties) formatted.properties = mapValues(formatted.properties, Schema);

  return formatted;
};

proto.fromJSON = function (desc, syntax) {
  //TODO: parse json-schema
};

proto.validate = function (value) {
  let type = types.check(this.type, value)
    , verifies = keys(this).filter(key => validates.has(key, type))
    , waiting = [];

  if (!type) return new TypeError(`Value ${value} not ins of ${toArray(this.type).map(t => t.name).join(',')}`);

  let finish = async () => {
    for (let [verify, validator] of waiting) {
      let result = await validator(value, this);
      if (isError(result)) return result;
      if (!result) {
        let {message, error} = validates.get(verify);
        return new error(template(message, {verify, value}));
      }
    }
  };

  for (let verify of verifies) {
    let result, {validator, async, message, error} = validates.get(verify);
    if (isAsyncFunction(validator)) waiting.push([verify, validator]);
    else if (async) waiting.push([verify, toAwait(validator)]);
    else {
      try {
        result = validator(value, this);
      } catch (err) {
        return new error(err.message, err);
      }
      if (!result) return new error(template(message, {verify, value}));
      if (isError(result)) return result;
      if (isAwait(result)) waiting.push([verify, () => result]);
    }
  }

  if (waiting.length)
    return {then: (success, filed) => finish().then(success, filed)};
};

proto.toJSON = function (syntax) {
  //TODO: to json-schema format;
  let {type, properties} = this
    , fixed = {
    type: type.toJSON ? type.toJSON() : type.name ? type.name.toLowerCase() : type,
    required: undefined,
  };

  if (properties)
    fixed.required = keys(properties).filter(prop => properties[prop].required);

  return {...this, ...fixed}
};

proto.inspect = function () {
  return ['Schema', this.$title, '{type:', toArray(this.type).map(t => t.name).join(',') + '}'].filter(Boolean).join(' ');
};

proto[Symbol.toStringTag] = () => 'Schema';

Schema.Types = types;
Schema.validates = validates;
Schema.schemas = schemas;
Schema.plugins = plugins;
// Schema.fromJS = (desc) => Schema(proto.fromJS(desc));
// Schema.fromJSON = (desc, version) => Schema(proto.fromJSON(desc, version));
// Schema.verify = (schema, value, wait, feed) => {
// };

export default Schema;
