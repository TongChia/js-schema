const _ = require('lodash');
const $ = require('async');
const {createSchema, $schema} = require('./schema');
const {ValidationError, messages} = require('./error');
const {_uniq, _size, iteratee} = require('./utils');
const {any} = require('./any');

const array = createSchema('array', _.isArray);
const isAsync = true;

_.each(
  {
    uniqueItems: {defaults: true, validator: (arr, y) => !y || _uniq(arr)},
    minItems: _size.min,
    maxItems: _size.max,
    contains: {
      isAsync, defaults: any, validator: (value, schema, callback) => $.someSeries(value,
        (item, cb) => schema.isValid(item, (invalid) => cb(null, _.isNil(invalid))),
        (err, valid) => callback(valid ? null : ValidationError(messages.containsError, {schema}), value)
      )
    },
    items: {
      isAsync, defaults: any, validator: (value, items, callback) =>
        $.times(_([value, items]).map('length').min(), (i, cb) =>
          iteratee(_.isArray(items) ? items[i] : items, value, i, 'array', 'items', cb), callback)
    },
    additionalItems: {
      isAsync, defaults: any, validator: function (value, schema, callback) {
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

array.hook('items', function (items, params = any, message) {
  return items(_.isArray(params) ? _.map(params, $schema) : params, message);
});

array.proto('reduce', function (params = any, message) {
  return this.items(params.length > 1 ? params : $schema(params), message);
});

module.exports = {
  array,
  unique: array.unique(true),
  $array: array.items
};
