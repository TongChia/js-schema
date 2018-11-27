const _ = require('lodash');
const $ = require('async');
const {createSchema, $schema} = require('./schema');
const {ValidationError, messages} = require('./error');
const {_uniq} = require('./utils');

const array = createSchema('array', _.isArray);
const isAsync = true;
// const defaults = true;

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
        $.times(_([value, items]).map('length').min(), (path, cb, schema) =>
          (schema = _.isArray(items) ? items[path] : items).isValid(value[path], (error, result) => {
            if (error) return cb(new ValidationError(messages.itemError, {path, value, error, schema}));
            value[path] = result;
            return cb();
          }), callback)
    },
    additionalItems: {
      isAsync, validator: function (value, schema, callback) {
        const items = this.get('items');
        if (!(items.length < value.length)) return callback(null, value);
        return $.eachOf(
          _.takeRight(value, value.length - items.length),
          (element, i, cb) => schema.isValid(element, (error, result) => {
            let path = items.length + i;
            if (error) return cb(new ValidationError(messages.additionalError, {
              type: 'array', keyword: 'additionalItems', path, value, error, schema
            }));
            value[path] = result;
            return cb();
          }),
          callback
        );
      }
    }
  },
  (validate, keyword) => array.addValidate(keyword, validate)
);

array.proto('unique', function (y, msg) {
  return this.uniqueItems(y, msg);
});

// array.hook('items', function (items, params, message) {
//   return items($schema(params), message);
// });

module.exports = {
  array,
  unique: array.unique(true)
};
