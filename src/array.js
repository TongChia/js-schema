const _ = require('lodash');
const $ = require('async');
const {createSchema, $schema} = require('./schema');
const {ValidationError, messages} = require('./error');
const {_uniq, iteratee} = require('./utils');
const {any} = require('./any');

const array = createSchema('array', _.isArray);
const isAsync = true;

_.each(
  {
    uniqueItems: (arr, y = true) => !y || _uniq(arr),
    minItems: (arr, l) => arr.length >= l,
    maxItems: (arr, l) => arr.length <= l,
    contains: {
      isAsync, validator: (value, schema, callback) => $.someSeries(value,
        (item, cb) => schema.isValid(item, (invalid) => cb(null, _.isNil(invalid))),
        (err, valid) => callback(valid ? null : ValidationError(messages.containsError, {schema}), value)
      )
    },
    items: {
      isAsync, validator: (value, items, callback) =>
        $.times(_([value, items]).map('length').min(), (i, cb) =>
          iteratee(_.isArray(items) ? items[i] : items, value, i, 'array', 'items', cb), callback)
    },
    additionalItems: {
      isAsync, validator: function (value, schema, callback) {
        const int = this.get('items.length');
        if (!(int < value.length)) return callback(null, value);
        //! ↑ also checked `items` is not `array`;
        return $.times(value.length - int, (n, cb) =>
          iteratee(schema, value, int + n, 'array', 'additionalItems', cb), callback);
      }
    }
  },
  (validate, keyword) => array.addValidate(keyword, validate)
);

array.proto('unique', function (y, msg) {
  return this.uniqueItems(y, msg);
});

array.hook('items', function (items, params = any, message, ...rest) {
  if (message === true) return items(params, ...rest);
  return items(params.length > 1 ? params : $schema(params), message, ...rest);
});

module.exports = {
  array,
  unique: array.unique(true)
};
