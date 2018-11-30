const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const boolean = createSchema('boolean', _.isBoolean);
_.each(keywords.common, (v, k) => boolean.addValidate(k, v));

module.exports = {boolean};
