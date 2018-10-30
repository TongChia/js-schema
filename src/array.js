const _ = require('lodash');
const $ = require('async');
const createSchema = require('./schemaFactory');
const VError = require('./error');
const {_true, _uniq} = require('./utils');

const _err = (path, cb) => (err) => {
  if (!err) return cb();
  return cb(new VError(`Invalid item in array[${path}] for array.items ( ${err.message} ).`));
}; // TODO: error message with more information;

const array = createSchema('array', _.isArray);

_.each(
  {
    unique:   _true(_uniq),
    minItems: (arr, l) => arr.length >= l,
    maxItems: (arr, l) => arr.length <= l,
    contains: {
      isAsync: true,
      validator: (arr, schema, callback) =>
        $.each(arr, (item, cb) => schema.isValid(item, cb), callback)
    },
    items: {
      isAsync: true,
      validator: (arr, items, callback) => _.isArray(items) ?
        $.eachOf(items, (s, i, cb) => s.isValid(arr[i], _err(i, cb)), callback) :
        $.eachOf(arr, (v, i, cb) => items.isValid(v, _err(i, cb)), callback)
    }
  },
  (validate, keyword) => array.addValidate(keyword, validate)
);

module.exports = {
  array,
  unique: array.unique()
};
