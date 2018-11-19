const _ = require('lodash');
const $ = require('async');
const {createSchema} = require('./schema');
const {ValidationError, messages} = require('./error');
const {_uniq} = require('./utils');

const array = createSchema('array', _.isArray);
const isAsync = true;
// const defaults = true;

_.each(
  {
    unique:   (arr, y = true) => !y || _uniq(arr),
    minItems: (arr, l) => arr.length >= l,
    maxItems: (arr, l) => arr.length <= l,
    contains: {
      isAsync,
      validator: (value, schema, callback) => $.someSeries(value,
        (item, cb) => schema.isValid(item, (invalid) => cb(null, _.isNil(invalid))),
        (err, valid) => callback(valid ? null : ValidationError(messages.containsError, {value}), value)
      )
    },
    items: {
      isAsync, // defaults,
      validator: (value, items, callback) => {
        _.isArray(items) ?
          // Tuple validation
          $.eachOf(items, (subSchema, path, cb) => subSchema.isValid(value[path], (error, result) => {
            if (error) return cb(new ValidationError(messages.itemError, {path, value, error, subSchema}));
            value[path] = result;
            return cb();
          }), callback) :
          // List validation
          $.eachOf(value, (element, path, cb) => items.isValid(element, (error, result) => {
            if (error) return cb(new ValidationError(messages.listError, {path, value, error, subSchema: items}));
            value[path] = result;
            return cb();
          }), callback);
      }
    },
    additionalItems: {
      isAsync, // defaults,
      validator: function (value, subSchema, callback) {
        const items = this.get('items');
        if (!(items.length < value.length)) return callback(null, value);
        return $.eachOf(
          _.takeRight(value, value.length - items.length),
          (element, i, cb) => subSchema.isValid(element, (error, result) => {
            let path = items.length + i;
            if (error) return cb(new ValidationError(messages.additionalError, {
              type: 'object', keyword: 'additionalItems', path, value, error, subSchema
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

module.exports = {
  array,
  unique: array.unique(true)
};
