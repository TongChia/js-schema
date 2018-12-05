const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const num = createSchema('number', _.isFinite);
const Num = num.class;

_.each(keywords.number, (validate, keyword) => Num.addValidate(keyword, validate));

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
}, (method, keyword) => Num.proto(keyword, method));

_.each(keywords.common, (v, k) => Num.addValidate(k, v));

const int = num.integer(true).set('type', 'integer');

module.exports = {
  num, int,
  number: num,
  integer: int,
};
