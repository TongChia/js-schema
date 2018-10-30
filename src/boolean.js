const _ = require('lodash');
const createSchema = require('./schemaFactory');

const boolean = createSchema('boolean', _.isBoolean);

module.exports = {boolean};
