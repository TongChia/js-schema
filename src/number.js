const _ = require('lodash');
const createSchema = require('./schemaFactory');
const {_true} = require('./utils');

const number = createSchema('number', (num) => (_.isNumber(num) && !_.isNaN(num)));

_.each(
  {
    integer: _true(_.isInteger),
    max:     (v, n, e) => e ? v <= n : v < n,
    min:     (v, n, e) => e ? v >= n : v > n,
    multipleOf: (v, m) => (v % m) === 0,
  },
  (validate, keyword) => number.addValidate(keyword, validate)
);

number.constructor.prototype.range = function (min, max, ...rest) {
  return this.max(max, ...rest).min(min, ...rest);
};

module.exports = {
  number,
  integer: number.integer()
};
