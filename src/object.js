const _ = require('lodash');
const $ = require('async');
const {_keys, iteratee} = require('./utils');
const {createSchema, $schema} = require('./schema');

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
        $.each(_keys(value, props), (key, cb) => iteratee(props[key], value, key, type, 'properties', cb), callback)
    },
    patternProperties: {
      isAsync, validator: (value, patternProps, callback) => {
        const keys = _.keys(value), patterns = _.keys(patternProps), entries = [];
        _.each(patterns, (pattern) => _.each(keys, key => {if (RegExp(pattern).test(key)) entries.push([key, pattern]);}));

        return $.each(entries, ([key, pattern], cb) => iteratee(patternProps[pattern], value, key, type, 'properties', cb), callback);
      }
    },
    additionalProperties: {
      isAsync, validator: function (value, schema, callback) {
        const keys = _.keys(value);

        if (this.has('properties'))
          _.pullAll(keys, _.keys(this.get('properties')));
        if (this.has('patternProperties'))
          _.pullAll(keys, _.filter(keys, key => _.some(_.keys(this.get('patternProperties')), pattern => RegExp(pattern).test(key))));

        return $.each(keys, (key, cb) => iteratee(schema, value, key, 'object', 'additionalProperties', cb), callback);
      }
    },
  },
  (validate, keyword) => object.addValidate(keyword, validate)
);

object.proto('size', function (min, max, ...rest) {
  return this.minProperties(min, ...rest).maxProperties(max, ...rest);
});

_.each(['properties', 'patternProperties'], key =>
  object.hook(key, function (old, params, message) {
    return old(_.mapValues(params, $schema), message);
  }));

module.exports = {
  object,
  Obj: object.properties
};
