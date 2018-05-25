const Sugar = require('sugar-core');
const {isUndefined} = require('./utils');
const {every} = Sugar.Array;

module.exports = {
  String: {
    enum     : (data, _enum) => _enum.includes(data),
    match    : (data, match) => match.test(data),
    minLength: (data, minLength) => (data.length >= minLength),
    maxLength: (data, maxLength) => (data.length <= maxLength)
  },
  Number: {
    min    : (data, min) => (data >= min),
    max    : (data, max) => (data <= max),
    integer: (data, integer) => (integer === false || Number.isInteger(data))
  },
  Date: {
    after : (data, after) => (new Date(data) > new Date(after)),
    before: (data, before) => (new Date(data) < new Date(before))
  },
  Array: {
    minItems: (data, minItems) => (data.length >= minItems),
    maxItems: (data, maxItems) => (data.length <= maxItems),
    unique  : (data, unique) => (!unique || data.every((v, i, d) => d.indexOf(v) === i)),
    items   : (data, schemas) => Array.isArray(schemas) ?
      every(schemas, (Schema, index) => Schema.isValid(data[index])) :
      every(data, (item) => schemas.isValid(item))
  },
  Object: {
    properties: (data, props) =>
      Sugar.Object.every(props, (Schema, key) => isUndefined(data[key]) || Schema.isValid(data[key])),
  }
};
