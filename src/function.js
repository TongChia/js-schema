const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const func = createSchema('function', _.isFunction);

func.superMethod('toJSON', function () {
  let {type, $js_schema, errorMessage, ...json} = toJSON.call(this);
  return {
    ...json,
    not: true,
    errorMessage: 'This is a JS-Schema validation, not support by json-schema, do not assignment.',
    $js_schema: {
      ...$js_schema,
      type,
      errorMessage
    },
  };
});

module.exports = {func, 'function': func};
