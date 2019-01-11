const _ = require('lodash');
const {createSchema, _schema} = require('./schema');
const {keywords} = require('./keywords');

const arr = createSchema('array', _.isArray);
const Arr = arr.class;

_.each(keywords.array,  (v, k) => Arr.addValidate(k, v));
_.each(keywords.common, (v, k) => Arr.addValidate(k, v));

Arr.proto('unique', function (y, msg) {
  return this.uniqueItems(y, msg);
});

Arr.hook('items', function (items, params, message) {
  return items(_.isArray(params) ? _.map(params, _schema) : _schema(params), message);
});

Arr.proto('reduce', function (params, message) {
  return this.items(_.get(params, 'length') > 1 ? params : _schema(params), message);
});

module.exports = {
  arr,
  array: arr,
  items: arr.items.bind(arr),
  unique: arr.unique(true),
};
