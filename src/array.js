const _ = require('lodash');
const $ = require('async');
const createSchema = require('./schemaFactory');
const {ValidationError} = require('./error');
const {_uniq} = require('./utils');

const _err = (path, cb) => (err) => {
  if (!err) return cb();
  return cb(new ValidationError(`Invalid item in array[${path}] for array.items ( ${err.message} ).`));
}; // TODO: error message with more information;

const array = createSchema('array', _.isArray);
const isAsync = true;

_.each(
  {
    unique:   (arr, y = true) => !y || _uniq(arr),
    minItems: (arr, l) => arr.length >= l,
    maxItems: (arr, l) => arr.length <= l,
    contains: {
      isAsync,
      validator: (arr, schema, callback) => $.someSeries(arr,
        (item, cb) => schema.isValid(item, (invalid) => cb(null, !invalid)),
        (err, valid) => callback(valid ? null : ValidationError('Invalid items for array.contains'), arr)
      )
    },
    items: {
      isAsync,
      validator: (arr, items, callback) => _.isArray(items) ?
        // Tuple validation
        $.eachOf(items, (s, i, cb) => s.isValid(arr[i], _err(i, cb)), callback) :
        // List validation
        $.eachOf(arr, (v, i, cb) => items.isValid(v, _err(i, cb)), callback)
    },
    additionalItems: {
      isAsync,
      validator: (arr, schema, callback) => {
        const items = _.get(this, '_.items.0');
        if (!_.isArray(items) || arr.length <= items.length) return callback();
        if (_.isFunction(schema.isValid))
          return $.eachOf(arr, (v, i, cb) => items.isValid(v, _err(i, cb)), callback);
      }
    }
  },
  (validate, keyword) => array.addValidate(keyword, validate)
);

module.exports = {
  array,
  unique: array.unique(true)
};
