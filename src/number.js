const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const number = createSchema('number', _.isFinite);

_.each(keywords.number, (validate, keyword) => number.addValidate(keyword, validate));

_.each({
  max: function (n, eq, ...rest) {
    return eq ? this.maximum(n, ...rest) : this.exclusiveMaximum(n, ...rest);
  },
  min: function (n, eq, ...rest) {
    return eq ? this.minimum(n, ...rest) : this.exclusiveMinimum(n, ...rest);
  },
  range: function (min, max, ...rest) {
    return this.min(min, ...rest).max(max, ...rest);
  }
}, (method, keyword) => number.proto(keyword, method));
_.each(keywords.common, (v, k) => number.addValidate(k, v));

const integer = number.integer(true).set('type', 'integer');

module.exports = {
  number,
  num: number,
  integer,
  int: integer
};
