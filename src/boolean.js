const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const bool = createSchema('boolean', _.isBoolean);
_.each(keywords.common, (v, k) => bool.class.addValidate(k, v));

module.exports = {bool, boolean: bool};
