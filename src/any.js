const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const mixed = createSchema('any');
const Mixed = mixed.class;

_.each(keywords, vs =>
  _.each(vs, (v, k) =>
    Mixed.addValidate(k, v)));

Mixed.hook('toJSON', function (toJSON) {
  if (this.original) return true;
  return toJSON();
});

module.exports = {
  any: mixed,
  '*': mixed,
  mixed,
  enums: mixed.enum.bind(mixed),
  constant: mixed['const'].bind(mixed),
};
