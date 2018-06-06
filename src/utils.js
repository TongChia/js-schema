const _ = module.exports = {};

_.hasBuffer = typeof Buffer !== 'undefined';
_.hasSymbol = typeof Symbol !== 'undefined';

_.simpleType = (v) => Object.prototype.toString.call(v).match(/^\[object (\w+)]$/)[1];

(['Object', 'Array', 'String', 'Boolean', 'Symbol', 'RegExp', 'Error',
  'Null', 'Undefined', 'Promise', 'Map', 'Set', 'AsyncFunction', 'GeneratorFunction'
]).forEach(type => {
  _['is' + type] = (v) => Object.prototype.toString.call(v) === `[object ${type}]`;
});

if (_.hasBuffer) _.isBuffer = Buffer.isBuffer;
_.isPlainFunction = (fn) => Object.prototype.toString.call(fn) === '[object Function]';
_.isFunction = (fn) => (typeof fn === 'function');
_.isConstructor = (fn) => (_.isPlainFunction(fn) && fn.prototype && fn.name);
_.isArray = Array.isArray;
_.isNaN = Number.isNaN;
_.isInteger = Number.isInteger;
_.isNil = (v) => (_.isUndefined(v) || _.isNull(v) || _.isNaN(v));
_.isNotUndefined = (v) => !_.isUndefined(v);
_.isDate = (date) => Object.prototype.toString.call(date) === '[object Date]' && !_.isNaN(date.getTime());
_.isNumber = (num) => Object.prototype.toString.call(num) === '[object Number]' && !_.isNaN(num);
_.isInvalidString = (str) => !(_.isString(str) && str.trim());

_.not = (v) => !v;
_.or = (fn1, fn2, ...others) => others.length ? _.or(_.or(fn1, fn2), ...others) : (value) => (fn1(value) || fn2(value));
_.and = (fn1, fn2, ...others) => others.length ? _.and(_.and(fn1, fn2), ...others) : (value) => (fn1(value) && fn2(value));

_.isPromisify = _.and(_.isObject, ({then}) => _.isPlainFunction(then));

_.template = (str, obj) => (new Function(...(Object.keys(obj)), 'return `' + str + '`')(...(Object.values(obj))));
_.toNull = (v) => _.isUndefined(v) ? null : v;
