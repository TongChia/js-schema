const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const none = createSchema('none', _.stubFalse);

none.proto('toJSON', function () {
  if (this.original) return false;
  let {type, ...json} = toJSON.call(this);
  return {...json, _type: type, not: true};
});

module.exports = {none};
