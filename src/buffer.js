const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const buffer = createSchema('buffer', _.isBuffer);

buffer.superMethod('toJSON', function () {
  return _.merge(toJSON.call(this), {type: 'string', $js_schema: {type: 'buffer'}});
});

module.exports = {buffer};
