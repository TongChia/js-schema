const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const createSchema = require('./schemaFactory');
const VError = require('./error');

const object = createSchema('object', _.isObject);

_.each(
  {
    required: (obj, props) => _.every(props, p => _.has(obj, p) && obj[p] !== undefined),
    dependencies: (obj, param) => _.every(param, (deps, prop) => (!_.has(obj, prop) || _.every(deps, dep => _.has(obj, dep)))),
    properties: {
      isAsync: true,
      validator: (obj, props, callback) =>
        $.each(_keys(obj, props),
          (path, cb) => props[path].isValid(obj[path], (err) => {
            if (!err) return cb();
            return cb(new VError(`Invalid value for object.properties[${path}] ( ${err.message} ).`));
          }),
          callback
        )
    }
  },
  (validate, keyword) => object.addValidate(keyword, validate)
);

module.exports = {
  object
};
