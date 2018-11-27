const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const any = createSchema('*', _.stubTrue);

any.proto('toJSON', function () {
  if (this.original) return true;
  let {type, ...json} = toJSON.call(this);
  return {...json, _type: type, not: false};
});

module.exports = {any};
