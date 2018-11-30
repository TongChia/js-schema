const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const buffer = createSchema('buffer', _.isBuffer);

_.each(keywords.buffer, (v, k) => buffer.addValidate(k, v));
_.each(keywords.common, (v, k) => buffer.addValidate(k, v));

module.exports = {buffer};
