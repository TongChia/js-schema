const _ = require('lodash');
const {keywords} = require('./keywords');
const {createSchema, _schema} = require('./schema');

const type = 'object';
const object = createSchema(type, _.isObject);

_.each(keywords.object, (v, k) => object.addValidate(k, v));
_.each(keywords.common, (v, k) => object.addValidate(k, v));

object.proto('size', function (min, max, ...rest) {
  return this.minProperties(min, ...rest).maxProperties(max, ...rest);
});

_.each(['properties', 'patternProperties'], key =>
  object.hook(key, function (old, params, message) {
    return old(_.mapValues(params, _schema), message);
  }));

module.exports = {
  object,
  obj: object,
  $object: object.properties,
};
