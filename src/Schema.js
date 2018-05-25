const Sugar = require('sugar-core');
const _ = require('./utils');
const {ValidationError} = require('./types');
const verifications = require('./validates');

const validates = new Map;
const {has, add, forEach, keys} = Sugar.Object;
const {append} = Sugar.Array;
const {partial} = Sugar.Function;

function createSchemaWrap (_super, keyword, parameter) {

  let fn = function Schema (obj) {this.raw = obj};
  let _v = validates.get(keyword);
  let isAwait = _.isAsyncFunction(_v.validator);

  fn.toJSON = () => add(_super.toJSON(), {[keyword]: parameter});

  fn.isValid = function (data, cb, next) {

    if (cb) {

      let _cb = (errors, result) => {
        if (!_v.validator(result, parameter))
          errors = append(errors || [], new _v.error(_v.message));

        return cb(errors, result);
      };

      return next ? next(data, _cb, _super.isValid) : _cb(null, data);

    } else {
      // TODO: force sync;
      // check data & skip async validator;
      return _super.isValid(data) && (isAwait || _v.async || _v.validator(data, parameter));
    }
  };

  // let descriptor = Object.getOwnPropertyDescriptor(fn.prototype, 'constructor');
  fn.prototype = Object.create(_super.prototype);
  let handler = {
    get: function(target, prop) {
      return (prop in target) ? target[prop] : _super[prop];
    },
    // construct: function(target, args) {
    //   let obj = Object.create(fn.prototype);
    //   this.apply(target, obj, args);
    //   return obj;
    // },
    // apply: function(target, that, args) {
    //   _super.apply(that,args);
    //   fn.apply(that,args);
    // }
  };
  let proxy = new Proxy(fn, handler);
  // descriptor.value = proxy;
  // Object.defineProperty(fn.prototype, 'constructor', descriptor);
  return proxy;
}


const ensureSugarNamespace = (namespace) => {
  let ns = has(Sugar, namespace) ?
    Sugar[namespace] :
    Sugar.createNamespace(namespace);

  if (!has(ns, 'isValid'))
    ns.defineStatic({isValid: (v, cb) => {
      let valid = _['is' + namespace](v); // TODO: check has;
      return cb ? cb(valid ? new TypeError('Value type should be ' + namespace) : null, v) : valid;
    }});

  if (!has(ns, 'toJSON'))
    ns.defineStatic({toJSON: () => ({type: namespace.toLowerCase()})});

  return ns;
};

const addKeyword = (namespace, keyword, validate) => {
  let {
    validator = validate,
    message = '${value} is not validated',
    error = ValidationError
  } = validate;
  let ns = ensureSugarNamespace(namespace);

  validates.set(keyword, {validator, message, error});
  ns.defineStatic({
    [keyword]: function (arg) {
      return createSchemaWrap(this, keyword, arg)
    }
  })
};

Sugar.Function.defineStatic({isValid: _.isFunction});

keys(_.types).forEach((type) => {
  ensureSugarNamespace(type).defineStatic('defineValidate', partial(addKeyword, type))
});

forEach(verifications, (verification, type) => {
  forEach(verification, (validate, keyword) => Sugar[type].defineValidate(keyword, validate))
});
