const _ = module.exports = {};

const hasReflect = typeof Reflect !== 'undefined';

_.simpleType = v => Object.prototype.toString.call(v).match(/^\[object (\w+)]$/)[1];

['Object', 'Array', 'Number', 'String', 'Boolean', 'Date', 'Symbol', 'Buffer', 'Null', 'Undefined', 'RegExp', 'Promise', 'Map', 'Set', 'AsyncFunction', 'Function'].forEach(type => {
  _['is' + type] = v => Object.prototype.toString.call(v) === `[object ${type}]`;
});
_['isFunc'] = _.isFunction;

_['isFunction'] = v => typeof v === 'function';

_['isConstructor'] = fn => _.isFunction(fn) && fn.prototype && fn.name;

_['isArray'] = Array.isArray;
_['isNaN'] = Number.isNaN;
_['isInteger'] = Number.isInteger;

_['isNil'] = v => (t => t && (t === 'Null' || t === 'Undefined'))(_.simpleType(v));

_.ownKeys = hasReflect ? Reflect.ownKeys : target => Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));

_.keys = Object.keys || (obj => {
  let result = [];

  for (let prop in obj) if (Object.hasOwnProperty.call(obj, prop)) result.push(prop);

  return result;
});

_.assign = Object.assign || ((O, obj, ...others) => {
  _.keys(obj).forEach(key => {
    O[key] = obj[key];
  });

  return others.length ? _.assign(O, ...others) : O;
});

_.includes = Array.prototype.includes ? (arr, ele, i) => Array.prototype.includes.call(arr, ele, i) : (arr, ele, i) => {
  if (_.isNil(arr)) throw TypeError('Cannot convert undefined or null to object');
  let o = Object(arr),
      len = o.length >>> 0;
  if (len === 0) return false;
  let n = i | 0,
      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

  while (k < len) {
    if (o[k] === ele) return true;
    k++;
  }

  return false;
};

_.different = (arr1, arr2) => arr1.filter(i => arr2.indexOf(i) < 0);

_.differences = (arr1, arr2) => arr1.filter(item => !_.includes(arr2, item));

_.intersection = (arr1, arr2) => arr1.filter(item => _.includes(arr2, item));

_.contains = (arr1, arr2) => _.differences(arr2, arr1).length === 0;

_.zip = (arr1, arr2) => arr1.map((item, index) => [item, arr2[index]]);

_.uniq = arr => arr.filter((item, index, self) => self.indexOf(item) === index);

_.has = (obj, prop) => _.includes(keys(obj), prop);

_.capitalize = str => str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');

_.times = (n, iterate) => {
  let i = 0,
      r = [];

  while (++i <= n) {
    r.push(iterate(i, n));
  }

  return r;
};