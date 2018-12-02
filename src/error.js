const _ = require('lodash');

const messages = {
  defaultError  : '`{value}` should valid for schema:{type}.{keyword}({params})',
  typeError     : '`{value}` should instance of {type}',
  elementError  : 'Invalid element[{path}] for schema:{type}.{keyword}({schema}) -> {error.message}',
  containsError : 'Invalid items for schema:array.contains({schema}) -> {error.message}'
};

const err = (template, defaults) => {
  if(_.get(template, 'isTemplate')) return template;

  const source  = _.trim(_.join(template, '')) || messages.defaultError;
  const reserve = _.clone(defaults);

  return _.assign((context) => {
    let ctx = _.defaults(context, reserve);
    return _.reduce(
      source.match(/{[^{^}]+}/g),
      (result, matched) => _.replace(
        result, RegExp(matched, 'i'),
        _.get(ctx, matched.slice(1, -1))
      ),
      source
    );
  }, {source, isTemplate: true});
};

/**
 * Validation Error
 * @param msg {string|function}
 * @param ctx {object}
 * @param ctx.status {string}
 * @param ctx.path {string}
 * @param ctx.params {string}
 * @param ctx.keyword {string}
 * @param ctx.type {string}
 * @param ctx.value {*}
 * @return {ValidationError}
 * @constructor
 */
function ValidationError (msg, ctx) {
  if (!new.target) return new ValidationError(msg, ctx);

  let {status = 422, errorType : name = 'ValidationError', path, error, ...rest} = Object(ctx);

  Error.call(this);
  if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  else this.stack = (new Error).stack;

  _.assign(this, {
    name, status, path: _.get(error, 'path') ? [path, error.path].join('.') : path,
    message: err(msg)({path, ...rest})
  });
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = Error;
ValidationError.prototype.class = ValidationError;

module.exports = {
  ValidationError,
  messages,
  err
};
