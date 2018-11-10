const _ = require('lodash');
const createSchema = require('./schemaFactory');
const {toJSON} = require('./utils');

const buffer = createSchema('buffer', _.isBuffer);

buffer.protoMethod('toJSON', function () {
  return _.merge(toJSON.call(this), {type: 'string', $js_schema: {type: 'buffer'}});
});

module.exports = {buffer};
