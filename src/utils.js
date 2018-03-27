const _ = module.exports = {};

_.hasReflect = typeof Reflect !== 'undefined';
_.hasBuffer = typeof Buffer !== 'undefined';

_.simpleType = (v) => Object.prototype.toString.call(v).match(/^\[object (\w+)]$/)[1];

(['Object', 'Array', 'String', 'Boolean', 'Symbol', 'RegExp', 'Error',
  'Null', 'Undefined', 'Promise', 'Map', 'Set', 'AsyncFunction', 'GeneratorFunction'
]).forEach(type => {
  _['is' + type] = (v) => Object.prototype.toString.call(v) === `[object ${type}]`;
});

_.isPlainFunction = (fn) => Object.prototype.toString.call(fn) === '[object Function]';
_.isFunction = (fn) => (typeof fn === 'function');
_.isConstructor = (fn) => (_.isPlainFunction(fn) && fn.prototype && fn.name);
_.isArray = Array.isArray;
_.isNaN = Number.isNaN;
_.isInteger = Number.isInteger;
_.isNil = (v) => (((t) => (t && (t === 'Null' || t === 'Undefined')))(_.simpleType(v)));
_.isDate = (date) => Object.prototype.toString.call(date) === '[object Date]' && !_.isNaN(date.getTime());
_.isNumber = (num) => Object.prototype.toString.call(num) === '[object Number]' && !_.isNaN(num);
_.isInvalidString = (str) => !(_.isString(str) && str.trim());

_.ownKeys = _.hasReflect ? Reflect.ownKeys :
  (target) => Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));

_.keys = Object.keys || ((obj) => {
  let result = [];
  for (let prop in obj)
    if (Object.prototype.hasOwnProperty.call(obj, prop))
      result.push(prop);
  return result;
});

_.values = Object.values || ((obj) => _.keys(obj).map(k => obj[k]));

_.entries = Object.entries || ((obj) => _.keys(obj).map(k => [k, obj[k]]));

_.assign = Object.assign || ((O, obj, ...others) => {
  _.keys(obj).forEach(key => {O[key] = obj[key]});
  return others.length ? _.assign(O, ...others) : O;
});

_.includes = Array.prototype.includes ?
  (arr, ele, i) => Array.prototype.includes.call(arr, ele, i) :
  (arr, ele, i) => {
    if (_.isNil(arr)) throw TypeError('Cannot convert undefined or null to object');
    let o = Object(arr), len = o.length >>> 0;
    if (len === 0) return false;
    let n = i | 0, k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      if (o[k] === ele) return true;
      k++;
    }
    return false;
  };

_.set = (obj, key, value) => {
  if (value !== undefined)
    obj[key] = value;
  return obj
};

_.mapValues = (obj, fn) => _.keys(obj).reduce((O, key) => _.set(O, key, fn(obj[key], key, obj)), Object.create(null));

_.different = (arr1, arr2) => arr1.filter(i => arr2.indexOf(i) < 0);

_.differences = (arr1, arr2) => arr1.filter(item => !_.includes(arr2, item));

_.intersection = (arr1, arr2) => arr1.filter(item => _.includes(arr2, item));

_.contains = (arr1, arr2) => _.differences(arr2, arr1).length === 0;

// _.zip = (arr1, arr2) => arr1.map((item, index) => [item, arr2[index]]);

_.uniq = (arr) => arr.filter((item, index, self) => self.indexOf(item) === index);

_.has = (obj, prop) => _.includes(_.keys(obj), prop);

_.capitalize = (str) => str.split('-').map(s => (s.charAt(0).toUpperCase() + s.slice(1))).join('');

_.template = (str, obj) => (new Function(...(_.keys(obj)), 'return `' + str + '`')(...(_.values(obj))));
// _.templateFn = (str, ...argNames) => new Function(...argNames, 'return `' + str + '`');

_.toArray = (value) => [].concat(value || []);

_.toAwait = (fn) => (...args) =>
  new Promise((resolve, reject) => {
    let cb = (result, err) => err ? reject(err) : resolve(result);
    try {
      fn(...args, cb);
    } catch (err) {
      if (err) reject(err)
    }
  });

_.toAsync = (fn) => {
  return (...args) => {
    let cb = args.pop();
    fn(...args).then(result => cb(null, result)).catch(err => cb(err))
  };
};

_.asyncValidate = () => {};
