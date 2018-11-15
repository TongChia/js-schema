const _ = require('lodash');
const {createSchema} = require('./schema');

const boolean = createSchema('boolean', _.isBoolean);

module.exports = {boolean};
