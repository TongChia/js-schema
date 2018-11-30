const _ = require('lodash');
const {createSchema, _schema} = require('./schema');
const {keywords} = require('./keywords');

const array = createSchema('array', _.isArray);

_.each(keywords.array,  (v, k) => array.addValidate(k, v));
_.each(keywords.common, (v, k) => array.addValidate(k, v));

array.proto('unique', function (y, msg) {
  return this.uniqueItems(y, msg);
});

array.hook('items', function (items, params, message) {
  return items(_.isArray(params) ? _.map(params, _schema) : _schema(params), message);
});

array.proto('reduce', function (params, message) {
  return this.items(_.get(params, 'length') > 1 ? params : _schema(params), message);
});

module.exports = {
  array,
  unique: array.unique(true),
  $array: array.items
};
