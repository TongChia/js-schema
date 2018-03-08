import {assign, keys, simpleType, template, has} from './utils';
import {simpleTypeDic as types} from './TypeDictionary';
import {validates} from "./ValidateMap";
import {Any} from "./types";

const TYPE = Symbol('type');
const PROPS = Symbol('properties');
const ITEMS = Symbol('items');

const normalizes = {
  Object: (define) => types.has(define.type) ?
    define :
    {type: Object, properties: define},
  Array : (items) => (items.length === 1) ?
    {type: Array, items: items[0]} :
    items.every(i => types.has(i)) ? //TODO: 且不重复
      {type: items} :
      {type: Array, items},
  $: (define) => (types.has(define) && {type: define}),
  get String() {return this.$},
  get Function() {return this.$}
};

const normalize = (define) => {
  let normalizer = normalizes[simpleType(define)];
  return normalizer && normalizer(define);
};

//TODO: Schema.schema, check normalized define. (like json-schema)
function Schema (define) {
  // recursive
  if (!new.target) return new Schema(define);
  if (define instanceof Schema) return new Schema(define.toJSON());

  let formatted = normalize(define);
  if (!formatted) throw new TypeError('Invalid argument');

  Object.defineProperties(this, {
    TYPE: {enumerable: false, writable: true},
    PROPS: {enumerable: false, writable: true},
    ITEMS: {enumerable: false, writable: true},
  });

  assign(this, formatted);
}

Schema.prototype.validate = function validate (value, callback) {
  for (const {validator, prop, message} of this.validates) {
    if (!validator(value, this[prop], this))
      if (callback)
        return callback(new Error(template(message, {value, prop})));
      else
        return false;
  }
  return callback ? callback() : true;
};

Schema.prototype.toJSON = function (version = 'v4') {
  let type = this.type;
  return assign(
    {type: types.name(type)},
    [].concat(type).includes(Object) && this.properties ?
      {properties: this.properties} : {},
    [].concat(type).includes(Array) && this.items ?
      {items: this.items} : {},
    this
  )
};

Schema.prototype.inspect = function inspect () {
  return `Schema {type: ${types.name(this.type)}}`
};

Object.defineProperties(Schema.prototype, {

  type: {
    get: function () {return this[TYPE]},
    set: function (v) {
      if (!types.has(v))
        throw new TypeError('Invalid value');
      this[TYPE] = types.get(v);
    }
  },

  properties: {
    get: function () {return this[PROPS]},
    set: function (v) {
      if (!isObject(v))
        throw new TypeError('Invalid value');
      this[PROPS] = keys(v).reduce((k, i, O) => {O[k] = Schema(v[k]); return O}, {})
    }
  },

  items: {
    get: function () {return this[ITEMS]},
    set: function (v) {
      this[ITEMS] = isArray(v) ? v.map(Schema) : Schema(v)
    }
  },

  validates: {
    enumerable: true,
    get: function getValidates () {
      return validates.get(['type'].concat(keys(this)))
    }
  }

});

Schema.Types = types;
Schema.validates = validates;

export default Schema;
