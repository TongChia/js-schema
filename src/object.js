const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const {createSchema} = require('./schema');
const {ValidationError, messages} = require('./error');

const object = createSchema('object', _.isObject);

_.each(
  {
    required: (obj, props) => _.every(props, p => _.has(obj, p) && obj[p] !== undefined),
    dependencies: (obj, param) => _.every(param, (deps, prop) => (!_.has(obj, prop) || _.every(deps, dep => _.has(obj, dep)))),
    minProperties: (obj, n) => _.size(obj) >= n,
    maxProperties: (obj, n) => _.size(obj) <= n,
    properties: {
      isAsync: true,
      validator: (value, props, callback) =>
        $.each(_keys(value, props),
          (path, cb) => props[path].isValid(value[path], (error, result) => {
            if (error) return cb(new ValidationError(messages.propertyError, {
              path, value, error, subSchema: props[path]
            }));
            value[path] = result;
            return cb();
          }),
          callback
        )
    }
  },
  (validate, keyword) => object.addValidate(keyword, validate)
);

object.superMethod('size', function (min, max, ...rest) {
  let result;
  if (min > 0)
    result = this.minProperties(min, ...rest);
  if (max >= min)
    result = result.maxProperties(max, ...rest);
  return result;
});

module.exports = {
  object
};
