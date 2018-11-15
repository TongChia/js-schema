const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const any = createSchema('*', _.stubTrue);

any.superMethod('toJSON', function () {
  let {type, $js_schema, ...json} = toJSON.call(this);
  return {...json, $js_schema: {...$js_schema, type}, not: false};
});

module.exports = {any};
