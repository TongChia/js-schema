const _ = require('lodash');
const createSchema = require('./schemaFactory');

const number = createSchema('number', (num) => (_.isNumber(num) && !_.isNaN(num)));

_.each({
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
    let result;
    if (_.isNumber(min))
      result = this.min(min, ...rest);
    if (max > min)
      result = result.max(max, ...rest);
    return result;
  }
}, (method, keyword) => number.protoMethod(keyword, method));

module.exports = {
  number,
  integer: _.merge(new number.class({type: 'integer'}), {isTyped: _.isInteger})
};
