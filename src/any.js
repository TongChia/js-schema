const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const any = createSchema('any');

_.each(keywords, vs =>
  _.each(vs, (v, k) =>
    any.addValidate(k, v)));

any.hook('toJSON', function (toJSON) {
  if (this.original) return true;
  return toJSON();
});

module.exports = {
  any,
  '*': any,
  enum: any.enum
};
