const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const buffer = createSchema('buffer', _.isBuffer);

buffer.proto('toJSON', function () {
  return {...toJSON.call(this), type: 'string', _type: 'buffer'};
});

module.exports = {buffer};
