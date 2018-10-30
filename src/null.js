const _ = require('lodash');
const createSchema = require('./schemaFactory');

const nil = createSchema('null', _.isNull);

module.exports = {
  nil,
  'null': nil
};
