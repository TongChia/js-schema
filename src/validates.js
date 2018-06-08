const Sugar = require('sugar-core');
const {parallel, reflectAll} = require('async');
const {formats} = require('./libs');
const {isArray, toNull} = require('./utils');
const {ValidationError} = require('./types');
const {multipleError} = ValidationError;

const {partial} = Sugar.Function;
const {merge, forEach} = Sugar.Object;

const verifications = {
  String: {
    enum     : (data, _enum) => _enum.includes(data),
    match    : (data, regexp) => RegExp(regexp).test(data),
    get pattern() {return this.match},
    minLength: (data, minLength) => (data.length >= minLength),
    maxLength: (data, maxLength) => (data.length <= maxLength),
    format   : (data, name) => (formats.has(name) && formats.get(name)(data)),
  },
  Number: {
    min    : (data, min) => (data >= min),
    max    : (data, max) => (data <= max),
    integer: (data, integer) => !integer || Number.isInteger(data),
  },
  Date: {
    after : (data, after) => (new Date(data) > new Date(after)),
    before: (data, before) => (new Date(data) < new Date(before))
  },
  Array: {
    minItems: (data, minItems) => (data.length >= minItems),
    maxItems: (data, maxItems) => (data.length <= maxItems),
    unique  : (data, unique) => !unique || data.every((v, i, d) => d.indexOf(v) === i),
    items   : function (data, items, cb) {
      let {every, map} = Sugar.Array;
      let checks = isArray(items) ?
        items.map((schema, i) => partial(schema.isValid, toNull(data[i])).bind(schema)) :
        data.map((d) => partial(items.isValid, toNull(d)).bind(items));

      if (!cb) return every(checks, fn => fn());

      return parallel(reflectAll(checks), (err, results) =>
        cb(multipleError(map(results, 'error')), map(results, 'value')))
    }
  },
  Object: {
    properties: function (data, props, cb) {
      let {every, map, has, filter} = Sugar.Object;
      let checkRequired = has(this, 'required');
      let required = this.required || [];
      let checks = map(props, (schema, prop) => partial(schema.isValid, toNull(data[prop])).bind(schema));

      if (!cb) return every(checks, fn => fn());

      return parallel(reflectAll(checks), (err, results) => {
        let errors = map(results, 'error');

        if (checkRequired)
          errors = filter(errors, (e, k) => !!e && (e.type !== 'Undefined' || required.includes(k)));

        return cb(multipleError(errors), map(results, 'value'));
      })
    },
    required: () => true
  }
};

let formatValidators = {
  'hostname': (data) => (/^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/).test(data)
};

try {
  let validator = require('validator');
  let isIP = validator['isIP'];

  merge(formatValidators, {
    'ipv4' : partial(isIP, undefined, 4),
    'ipv6' : partial(isIP, undefined, 6)
  });

  forEach({
    'data-time': 'isRFC3339',
    'numeric'  : 'isNumeric',
    'email'    : 'isEmail',
    'url'      : 'isURL',
  }, (v, k) => merge(formatValidators, {[k]: validator[v]}));

} catch (e) {
  if (e.message === "Cannot find module 'validator'")
    console.warn('no module `validator` found, formats method can not use.')
}

module.exports = {
  verifications,
  formatValidators
};
