const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const buff = createSchema('buffer', _.isBuffer);

_.each(keywords.buffer, (v, k) => buff.class.addValidate(k, v));
_.each(keywords.common, (v, k) => buff.class.addValidate(k, v));

module.exports = {buff, buffer: buff};
