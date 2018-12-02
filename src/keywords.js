const _ = require('lodash');
const $ = require('async');
const {formats} = require('./formats');
const {ValidationError : Err, messages} = require('./error');

const isAsync = true;
const min = (obj, n) => _.size(obj) >= n;
const max = (obj, n) => _.size(obj) <= n;
const _equal = (v, c) => _.isObjectLike(v) ? _.isEqual(c, v) : _.eq(c, v);
const _keys = (obj1, obj2) => _.intersection(_.keys(obj1), _.keys(obj2));
const _uniq = (arr) => _.every(arr, (item, i) => _.eq(_.indexOf(arr, item), i));
const toDate = (d) => new Date(_.isFunction(d) ? d() : d);
const iteratee = (schema, value, path, type, keyword, cb) =>
  schema.isValid(value[path], (error, result) =>
    error ?
      cb(new Err(messages.elementError, {type, keyword, path, error, schema})):
      cb(null, value[path] = result)
  );

const keywords = {

  number: {
    enum   : _.flip(_.includes),
    integer: {defaults: true, validator: (n, y) => !y || _.isInteger(n)},
    maximum: _.lte,
    minimum: _.gte,
    exclusiveMaximum: _.lt,
    exclusiveMinimum: _.gt,
    multipleOf: (v, m) => (v % m) === 0,
  },

  string: {
    enum     : _.flip(_.includes),
    minLength: min,
    maxLength: max,
    pattern  : (v, r) => RegExp(r).test(v),
    format   : (v, format) => formats[format](v),
    regexp   : (v, [source, flags]) => RegExp(source, flags).test(v),
    _format  : (v, [format, ...rest]) => formats[String(format)](v, ...rest)
  },

  array: {
    uniqueItems: {defaults: true, validator: (arr, y) => !y || _uniq(arr)},
    minItems: min,
    maxItems: max,
    contains: {
      isAsync, validator: (value, schema, callback) => $.someSeries(value,
        (item, cb) => schema.isValid(item, (invalid) => cb(null, _.isNil(invalid))),
        (err, valid) => callback(valid ? null : Err(messages.containsError, {schema}), value)
      )
    },
    items: {
      isAsync, validator: (value, items, callback) =>
        $.times(_([value, items]).map('length').min(), (i, cb) =>
          iteratee(_.isArray(items) ? items[i] : items, value, i, 'array', 'items', cb), callback)
    },
    additionalItems: {
      isAsync, validator: function (value, schema, callback) {
        const int = this.get('items.length');
        if (!(int < value.length)) return callback(null, value);
        //! ↑ also checked `items` is not `array`;
        return $.times(value.length - int, (n, cb) =>
          iteratee(schema, value, int + n, 'array', 'additionalItems', cb), callback);
      }
    }
  },

  object: {
    required: (obj, props) => _.every(props, p => _.has(obj, p) && obj[p] !== undefined),
    dependencies: (obj, param) => _.every(param, (deps, prop) => (!_.has(obj, prop) || _.every(deps, dep => _.has(obj, dep)))),
    minProperties: min,
    maxProperties: max,
    matched: {defaults: true, validator (obj, y) {
      let matched = 0, n = Number(y), keys = _.keys(obj),
        patterns = _.keys(this.get('patternProperties'));

      if (n <= 0) return true;
      if (!_.size(obj)) return false;

      while (matched < n) {
        if (!keys.length) return false;
        let key = keys.shift();
        if (this.has(['properties', key]) || _.some(patterns, pattern => RegExp(pattern).test(key)))
          matched ++;
      }

      return true;
    }},
    properties: {
      isAsync, validator: (value, props, callback) =>
        $.each(_keys(value, props), (key, cb) => iteratee(props[key], value, key, 'object', 'properties', cb), callback)
    },
    patternProperties: {
      isAsync, validator (value, patternProps, callback) {
        const keys = _.keys(value), patterns = _.keys(patternProps), entries = [];
        _.each(patterns, (pattern) => _.each(keys, key => {if (RegExp(pattern).test(key)) entries.push([key, pattern]);}));

        return $.each(entries, ([key, pattern], cb) => iteratee(patternProps[pattern], value, key, 'object', 'patternProperties', cb), callback);
      }
    },
    additionalProperties: {
      isAsync, validator (value, schema, callback) {
        const patterns = _.keys(this.get('patternProperties'));
        const others = _.reject(_.keys(value), (key) =>
          (this.has(['properties', key]) || _.some(patterns, pattern => RegExp(pattern).test(key))));

        return $.each(others, (key, cb) => iteratee(schema, value, key, 'object', 'additionalProperties', cb), callback);
      }
    },
    propertyNames: {
      isAsync, validator: (value, schema, callback) =>
        $.each(_.keys(value), (key, cb) => schema.isValid(key, cb), callback),
    }
  },

  buffer: {
    minBytes: min,
    maxBytes: max,
  },

  date: {
    before: (v, d) => _.lt(v, toDate(d)),
    after:  (v, d) => _.gte(v, toDate(d)),
  },

  common: {
    enum: (v, arr) => _.some(arr, (ele) => _equal(v, ele)),
    'const': _equal
  },

  any: {
    not: {
      isAsync, validator: (value, params, cb) =>
        params.isValid(value, (err) =>
          cb(err ? null : new Err(messages.defaultError, {value, params})))
    },
    anyOf: {
      isAsync, validator: (value, params, cb) =>
        $.someSeries(params, (schema, cb) => schema.isValid(value, (invalid) => cb(null, _.isNil(invalid))),
          (err, valid) => cb(valid ? null : Err(messages.defaultError, {type: '*', keyword: 'oneOf', value, params})))
    },
    allOf: {
      isAsync, validator: (v, schemas, cb) =>
        $.every(schemas, (schema, cb) => schema.isValid(v, cb), cb)
    },
    oneOf: {
      isAsync, validator: (value, params, cb) =>
        $.reduce(params, false, (matched, schema, cb) => schema.isValid(value, (invalid) =>
          cb(!invalid && matched, !invalid || matched)), (twice, once) =>
          cb((twice || !once) ? new Err(messages.defaultError, {type: '*', keyword: 'oneOf', value, params}) : null))
    },
  },
};

module.exports = {
  _keys,
  keywords
};
