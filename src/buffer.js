const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const buf = createSchema('buffer', _.isBuffer);

_.each(keywords.buffer, (v, k) => buf.addValidate(k, v));
_.each(keywords.common, (v, k) => buf.addValidate(k, v));

module.exports = {buf, buffer: buf};
