const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');

const func = createSchema('function', _.isFunction);

func.proto('toJSON', function () {
  let {type, ...json} = toJSON.call(this);
  return {
    ...json,
    _type: type,
    errorMessage: 'This is a JS-Schema validation, not support by json-schema, do not assignment.'
  };
});

module.exports = {func, 'function': func};
