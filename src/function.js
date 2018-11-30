const _ = require('lodash');
const {createSchema} = require('./schema');

const func = createSchema('function', _.isFunction);

module.exports = {func, 'function': func};
