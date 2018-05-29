const Sugar = require('sugar-core');
const _ = require('./utils');
const {ValidationError} = require('./types');
const verifications = require('./validates');

const validates = new Map;
const {types, isUndefined, isAsyncFunction, isNil} = _;
const {has, add, forEach, keys} = Sugar.Object;
const {partial} = Sugar.Function;
const {concatError} = ValidationError;

const Schema =
function parseJsonSchema (json) {
  //TODO: parse json-schema
};

const createSchemaWrap = (_super, keyword, parameter) => {

  let fn = function SchemaChain (obj) {this.raw = obj};
  let _v = validates.get(keyword);
  let {validator, message, error} = _v;
  let isAwait = isAsyncFunction(validator);

  if (_.isUndefined(parameter)) parameter = true;

  fn.toJSON = () => add(_super.toJSON(), {[keyword]: parameter});

  fn.isValid = function (data, cb) {

    // TODO: fix  ↓  global / Window;
    let toJSON = this.toJSON || fn.toJSON;
    let json = toJSON();

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

  let handler = {
    get: function(target, prop) {
      return (prop in target) ? target[prop] : _super[prop];
    },
    // TODO: create Model
    construct: function(target, args) {
      return new _super(...args);
    },
    apply: function(target, that, args) {
      return _super.apply(that, args);
    }
  };
  return new Proxy(fn, handler);
};

const ensureSugarNamespace = (namespace) => {
  let ns = has(Sugar, namespace) ?
    Sugar[namespace] :
    Sugar.createNamespace(namespace);

  if (!has(ns, 'isValid'))
    ns.defineStatic({isValid: function (v, cb) {
      let isUnd = isNil(v);
      let valid = !isUnd && _['is' + namespace](v);

      if (!cb) return valid;

      let err =
        isUnd ? ValidationError('${title} is not defined.', {error: 'Undefined'}) :
        valid ? null : ValidationError('${title} type should be ' + namespace + '.', {error: 'TypeError'});

      return cb(err, v);
    }});

  if (!has(ns, 'toJSON'))
    ns.defineStatic({toJSON: () => ({type: namespace.toLowerCase()})});

  return ns;
};

const addKeyword = (namespace, keyword, validate) => {
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

// Sugar.Function.defineStatic({isValid: isFunction});

keys(types).forEach((type) => {
  ensureSugarNamespace(type).defineStatic('defineValidate', partial(addKeyword, type))
});

forEach(verifications, (verification, type) => {
  forEach(verification, (validate, keyword) => Sugar[type].defineValidate(keyword, validate))
});

module.exports = Schema;
