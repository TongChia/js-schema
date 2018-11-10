const _ = require('lodash');

const version = '0.2';

const toJSON = function () {
  return _.merge(_.mapValues(this._, _.first), {
    type: this.type,
    $js_schema: {
      version,
      'error_message': _.mapValues(this._, _.partial(_.get, _, 2))
    }
  });
};

// get keys intersection.
const _keys = (obj1, obj2) => _.intersection(_.keys(obj1), _.keys(obj2));

const _uniq = (arr) => _.every(arr, (item, i) => _.eq(_.indexOf(arr, item), i));

module.exports = {
  _keys,
  _uniq,
  toJSON
};
