const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const none = createSchema('none', _.stubFalse);

none.superMethod('toJSON', function () {
  let {type, $js_schema, ...json} = toJSON.call(this);
  return {...json, $js_schema: {...$js_schema, type}, not: true};
});

module.exports = {none};
