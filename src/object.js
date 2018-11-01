const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const createSchema = require('./schemaFactory');
const VError = require('./error');

const _err = (path, cb) => (err) => {
  if (!err) return cb();
  return cb(new VError(`Invalid value for object.properties[${path}] ( ${err.message} ).`));
};

const object = createSchema('object', _.isObject);

_.each(
  {
    required: (obj, props) => _.every(props, p => _.has(obj, p) && obj[p] !== undefined),
    properties: {
      isAsync: true,
      validator: (obj, props, callback) =>
        $.each(_keys(obj, props),
          (k, cb) => props[k].isValid(obj[k], _err(k, cb)),
          callback
        )
    }
  },
  (validate, keyword) => object.addValidate(keyword, validate)
);

module.exports = {
  object
};
