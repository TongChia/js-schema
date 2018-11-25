const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const any = createSchema('*', _.stubTrue);

any.superMethod('toJSON', function () {
  if (this.original) return true;
  let {$js_schema, ...json} = toJSON.call(this);
  return {$js_schema: {...$js_schema, ...json}, not: false};
});

module.exports = {any};
