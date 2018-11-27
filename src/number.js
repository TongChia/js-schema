const _ = require('lodash');
const {createSchema} = require('./schema');

const number = createSchema('number', _.isFinite);

_.each({
  enum   : _.flip(_.includes),
  maximum: _.lte,
  minimum: _.gte,
  exclusiveMaximum: _.lt,
  exclusiveMinimum: _.gt,
  multipleOf: (v, m) => (v % m) === 0,
}, (validate, keyword) => number.addValidate(keyword, validate));

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

module.exports = {
  number,
  integer: _.assign(new number.class({type: 'integer'}), {isTyped: _.isInteger})
};
