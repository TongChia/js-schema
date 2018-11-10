const _ = require('lodash');
const createSchema = require('./schemaFactory');
const {toJSON} = require('./utils');

const buffer = createSchema('buffer', _.isBuffer);

buffer.protoMethod('toJSON', function () {
  return {type: 'string', '$js-schema$': toJSON.call(this)};
});

module.exports = {buffer};
