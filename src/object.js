const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const {createSchema, $schema} = require('./schema');
const {ValidationError, messages} = require('./error');

const type = 'object';
const object = createSchema(type, _.isObject);
const isAsync = true;

_.each(
  {
    required: (obj, props) => _.every(props, p => _.has(obj, p) && obj[p] !== undefined),
    dependencies: (obj, param) => _.every(param, (deps, prop) => (!_.has(obj, prop) || _.every(deps, dep => _.has(obj, dep)))),
    minProperties: (obj, n) => _.size(obj) >= n,
    maxProperties: (obj, n) => _.size(obj) <= n,
    properties: {
      isAsync, validator: (value, props, callback) =>
        $.each(_keys(value, props),
          (path, cb) => props[path].isValid(value[path], (error, result) => {
            if (error) return cb(new ValidationError(messages.propertyError, {
              type, keyword: 'properties', path, value, error, schema: props[path]
            }));
            value[path] = result;
            return cb();
          }),
          callback
        )
    },
    patternProperties: {
      isAsync, validator: (value, patternProps, callback) => {
        const keys = _.keys(value), patterns = _.keys(patternProps), entries = [];
        _.each(patterns, (pattern) => _.each(keys, path => {
          if (RegExp(pattern).test(path)) entries.push([path, pattern]);
        }));
        $.each(entries, ([path, pattern], cb) => patternProps[pattern].isValid(value[path], (error, result) => {
          if (error) return cb(new ValidationError(messages.propertyError, {
            type, keyword: 'patternProperties', path: pattern, value, error, schema: patternProps[pattern]
          }));
          value[path] = result;
          return cb();
        }), callback);
      }
    },
    additionalProperties: {
      isAsync, validator: function (value, subSchema, callback) {
        const keyword = 'additionalProperties';
        const props = this.get('properties'), patternProps = this.get('patternProperties');
        let additional = _.pullAll(_.keys(value), _.keys(props));
        if (patternProps) {
          const patterns = _.keys(patternProps);
          const matched = _.filter(_.keys(value), key => _.some(patterns, pattern => RegExp(pattern).test(key)));
          additional = _.pullAll(additional, matched);
        }
        return $.each(additional,
          (path, cb) => subSchema.isValid(value[path], (error, result) => {
            if (error) return cb(new ValidationError(messages.additionalError, {
              type, keyword, path, value, error, subSchema
            }));
            value[path] = result;
            return cb();
          }),
          callback
        );
      }
    },
  },
  (validate, keyword) => object.addValidate(keyword, validate)
);

object.proto('size', function (min, max, ...rest) {
  let result;
  if (min > 0)
    result = this.minProperties(min, ...rest);
  if (max >= min)
    result = result.maxProperties(max, ...rest);
  return result;
});

_.each(['properties', 'patternProperties'], key =>
  object.hook(key, function (old, params, message) {
    return old(_.mapValues(params, $schema), message);
  }));

module.exports = {
  object,
  Obj: object.properties
};
