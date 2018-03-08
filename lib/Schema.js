"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("./utils");

var _TypeDictionary = require("./TypeDictionary");

var _ValidateMap = require("./ValidateMap");

var _types = require("./types");

const TYPE = Symbol('type');
const normalizes = {
  Object: define => Schema.Types.has(define.type) ? define : {
    type: Object,
    prototypes: (0, _utils.keys)(define).reduce((O, key) => (0, _utils.assign)(O, {
      [key]: new Schema(define[key])
    }), {})
  },
  Array: items => items.length === 1 && _TypeDictionary.simpleTypeDic.has(items[0]) ? {
    type: Array,
    items: Schema({
      type: _TypeDictionary.simpleTypeDic.get(items[0])
    })
  } : items.every(i => _TypeDictionary.simpleTypeDic.has(i)) ? //TODO: 且不重复
  {
    type: items.map(i => _TypeDictionary.simpleTypeDic.get(i))
  } : {
    type: Array,
    items: items.map(Schema)
  },
  $: define => _TypeDictionary.simpleTypeDic.has(define) && {
    type: define
  },

  get String() {
    return this.$;
  },

  get Function() {
    return this.$;
  }

}; //TODO: Schema.schema, check normalized define. (like json-schema)

function Schema(define) {
  // recursive
  if (!new.target) return new Schema(define);
  Object.defineProperty(this, TYPE, {
    enumerable: false,
    writable: true,
    value: _types.Any
  });
  let normalizer = normalizes[(0, _utils.simpleType)(define)];
  if (!normalizer) throw new TypeError('Invalid argument');
  let handled = normalizer(define);
  if (!handled) throw new TypeError('Invalid argument');
  (0, _utils.assign)(this, handled);
}

Schema.prototype.validate = function (value, callback) {
  for (const [{
    validator,
    prop,
    message
  }] of this.validates) {
    if (!validator(value)) if (callback) return callback(new Error((0, _utils.template)(message, {
      value,
      prop
    })));else return false;
  }
};

Schema.prototype.toJSON = function (version = 'v4') {
  return (0, _utils.assign)({
    type: _TypeDictionary.simpleTypeDic.name(this.type)
  }, this);
};

Object.defineProperties(Schema.prototype, {
  type: {
    enumerable: true,
    get: function () {
      return this[TYPE];
    },
    set: function (v) {
      if (!_TypeDictionary.simpleTypeDic.has(v)) throw new TypeError('Invalid value');
      this[TYPE] = _TypeDictionary.simpleTypeDic.get(v);
    }
  },
  inspect: {
    enumerable: false,
    value: function inspect() {
      return `Schema {type: ${_TypeDictionary.simpleTypeDic.name(this.type)}}`;
    }
  },
  validates: {
    enumerable: true,
    get: function getValidates() {
      return _ValidateMap.validates.get(['type'].concat((0, _utils.keys)(this)));
    }
  },
  validate: {
    enumerable: true,
    value: function validate(value, callback) {
      for (const _ref of this.validates) {
        const {
          validator,
          prop,
          message
        } = _ref;
        if (!validator(value, this[prop], this)) if (callback) return callback(new Error((0, _utils.template)(message, {
          value,
          prop
        })));else return false;
      }

      return callback ? callback() : true;
    }
  }
});
Schema.Types = _TypeDictionary.simpleTypeDic;
Schema.validates = _ValidateMap.validates;
var _default = Schema;
exports.default = _default;