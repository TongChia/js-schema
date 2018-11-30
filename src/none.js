const _ = require('lodash');
const {createSchema} = require('./schema');

const none = createSchema('none', _.stubFalse);

none.hook('toJSON', function (toJSON) {
  if (this.original) return false;
  return _.assign(toJSON(), {not: true});
});

module.exports = {none};
