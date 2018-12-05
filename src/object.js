const _ = require('lodash');
const {keywords} = require('./keywords');
const {createSchema, _schema} = require('./schema');

const obj = createSchema('object', _.isObject);
const Obj = obj.class;

_.each(keywords.object, (v, k) => Obj.addValidate(k, v));
_.each(keywords.common, (v, k) => Obj.addValidate(k, v));

Obj.proto('size', function (min, max, ...rest) {
  return this.minProperties(min, ...rest).maxProperties(max, ...rest);
});

_.each(['properties', 'patternProperties'], key =>
  Obj.hook(key, function (old, params, message) {
    return old(_.mapValues(params, _schema), message);
  }));

module.exports = {obj, object: obj};
