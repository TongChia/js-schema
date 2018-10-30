const _ = require('lodash');

// get keys intersection.
const _keys = (obj1, obj2) => _.intersection(_.keys(obj1), _.keys(obj2));

const _uniq = (arr) => _.every(arr, (item, i) => _.eq(_.indexOf(arr, item), i));

// undefined = true.
const _true = (fn) => (v, bool) => {
  if (bool || _.isUndefined(bool)) return fn(v);
  return true;
};

module.exports = {
  _keys,
  _true,
  _uniq
};
