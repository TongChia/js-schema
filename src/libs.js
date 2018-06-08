const Sugar = require('sugar-core');
const _ = require('./utils');
const {ValidationError} = require('./types');

const validates = new Map;
const formats = new Map;
const {isUndefined, isAsyncFunction, isNil} = _;
const {has, add} = Sugar.Object;
const {concatError} = ValidationError;

const createSchemaWrap = (_super, keyword, parameter) => {

  let fn = function SchemaChain (obj) {this.raw = obj};
  let _v = validates.get(keyword);
  let {validator, message, error} = _v;
  let isAwait = isAsyncFunction(validator);

  if (isUndefined(parameter)) parameter = true;

  fn.toJSON = () => add(_super.toJSON(), {[keyword]: parameter});

  fn.isValid = function (data, cb) {

    const json = this.toJSON();

    // TODO: force sync;
    if (!cb) // check data & skip async validator;
      return _super.isValid.call(this, data) && (isAwait || _v.async || validator.call(json, data, parameter));

    return _super.isValid.call(this, data, (errors, result) => {
      if (isUndefined(result))
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

const ensureSugarNamespace = (namespace) => {
  const ns = has(Sugar, namespace) ? Sugar[namespace] : Sugar.createNamespace(namespace);
  const isType = 'is' + namespace;
  const checkMethod = Sugar.Object[isType] || _[isType];

  if (!has(ns, 'isValid') || ns.isValid.length === 1)
    ns.defineStatic({isValid: function (v, cb) {
      let unNil = !isNil(v);
      let valid = unNil && checkMethod(v);

      if (!cb) return valid;

      let err = unNil ? valid ? null :
        ValidationError('${title} type should be ' + namespace + '.', {error: 'TypeError'}) :
        ValidationError('${title} is not defined.', {error: 'Undefined'});

      return cb(err, v);
    }});

  if (!has(ns, 'toJSON'))
    ns.defineStatic({toJSON: () => ({type: (namespace.toLowerCase())})});

  return ns;
};

const addValidateKeyword = (namespace, keyword, validate) => {
  let {
    validator = validate,
    message = 'Value is not validated',
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

const addFormatValidator = (format, validator) => {
  formats.set(format, validator);
};

module.exports = {
  validates,
  formats,
  createSchemaWrap,
  addFormatValidator,
  ensureSugarNamespace,
  addValidateKeyword
};
