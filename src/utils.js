const _ = require('lodash');

// get keys intersection.
const _keys = (obj1, obj2) => _.intersection(_.keys(obj1), _.keys(obj2));

const _uniq = (arr) => _.every(arr, (item, i) => _.eq(_.indexOf(arr, item), i));

module.exports = {
  _keys,
  _uniq,
};
