const Sugar = require('sugar');
const _ = require('./utils');
const {ValidationError} = require('./types');

const formats = new Map;
const {isUndefined, isAsyncFunction, isNil, isRegExp, isFunction, isString} = _;
const {has, set} = Sugar.Object;
const {concatError} = ValidationError;
const defineStatic = (target, method, fn) =>
  has(target, 'defineStatic') ? target.defineStatic(method, fn) : set(target, method, fn);

const createSchemaChain = (_super, keyword, parameter, validate) => {

  // let fn = function SchemaChain (obj) {this.raw = obj};
  let fn = (...args) => fn.isValid(...args);

  if (isUndefined(parameter)) parameter = true;

  fn.toJSON = () => set(_super.toJSON(), keyword, parameter);

  fn.isValid = function (data, cb) {
    let {validator = validate, message = '${title} is not validated', error = ValidationError} = validate;
    let isAwait = isAsyncFunction(validator);
    let json = this.toJSON();

    // TODO: force sync;
    if (!cb) // check data & skip async validator;
      return _super.isValid.call(this, data) && (isAwait || validate.async || validator.call(json, data, parameter));

    return _super.isValid.call(this, data, (errors, result) => {
      if (isNil(result))
        return cb(errors, result);

      if (validator.length >= 3)
        return validator.call(json, result, parameter, (err, res) => {
          return cb(concatError(errors, err), res)
        });

      if (!validator.call(json, data, parameter))
        errors = concatError(errors, new error(message));
      return cb(errors, result)
    })
  };

  return new Proxy(fn, {
    get: function(target, prop) {
      return (prop in target) ? target[prop] : _super[prop];
    }
  });
};

const createNamespace = function (namespace, isValid) {
  if (has(this, namespace)) return this[namespace];

  const ns = function (obj) {this.raw = obj};
  const methods = new Set;

  // ns.name = namespace + 'Schema';

  ns.defineStatic = (method, fn) => {
    methods.add(method);
    ns[method] = fn;
    return ns;
  };

  ns.extend = (target) => methods.forEach(method => defineStatic(target, method, ns[method]));

  ns.defineStatic('isValid', function (v, cb) {
    let unNil = !isNil(v);
    let valid = unNil && isValid(v);

    if (!cb) return valid;

    let err = unNil ? valid ? null :
      ValidationError('${title} type should be ' + namespace + '.', {error: 'TypeError'}) :
      ValidationError('${title} is not defined.', {error: 'Undefined'});

    return cb(err, v);
  });

  ns.defineStatic('toJSON', () => ({type: (namespace.toLowerCase())}));

  ns.defineStatic('defineValidate', addValidateKeyword);

  return this[namespace] = ns;
};

const addValidateKeyword = function (keyword, validate) {
  return this.defineStatic([keyword], function (arg) {
    return createSchemaChain(this, keyword, arg, validate)
  })
};

const addFormatValidator = (format, validator) => {
  if (isRegExp(validator))
    formats.set(format, (data) => validator.test(data));
  if (isString(validator))
    formats.set(format, (data) => RegExp(validator).test(data));
  if (isFunction(validator))
    formats.set(format, validator);
};

const extend = function (target = this) {
  forEach(this, (ns, space) => {
    if (has(ns, 'extend') && has(target, space))
      ns.extend(target[space])
  })
};

module.exports = {
  formats,
  addFormatValidator,
  createNamespace,
  extend
};
