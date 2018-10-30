const _ = require('lodash');
const createSchema = require('./schemaFactory');

const buffer = createSchema('buffer', _.isBuffer);

module.exports = {buffer};
