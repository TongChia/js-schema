const _ = require('lodash');
const {ValidationError, messages} = require('./error');

// get keys intersection.
const _keys = (obj1, obj2) => _.intersection(_.keys(obj1), _.keys(obj2));

const _uniq = (arr) => _.every(arr, (item, i) => _.eq(_.indexOf(arr, item), i));

const iteratee = (schema, value, path, type, keyword, cb) =>
  schema.isValid(value[path], (error, result) =>
    error ?
      cb(new ValidationError(messages.elementError, {type, keyword, path, error, schema})):
      cb(null, value[path] = result)
  );

module.exports = {
  _keys,
  _uniq,
  iteratee,
};
