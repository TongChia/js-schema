const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');
const {_size} = require('./utils');

const buffer = createSchema('buffer', _.isBuffer);

_.each({
  minBytes: _size.min,
  maxBytes: _size.max,
}, (validator, keyword) => buffer.addValidate(keyword, validator));

buffer.proto('toJSON', function () {
  return {...toJSON.call(this), type: 'string', _type: 'buffer'};
});

module.exports = {buffer};
