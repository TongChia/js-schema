const _ = require('lodash');
const {createSchema} = require('./schema');

const nil = createSchema('null', _.isNull);

module.exports = {
  nil,
  'null': nil
};
