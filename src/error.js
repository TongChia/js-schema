const _ = require('lodash');

const err = (template, defaults) => {
  if(_.get(template, 'isTemplate')) return template;

  let source = _.trim(_.join(template, '') || '{value} should valid for schema:{type}:{keyword}({params}).');

  return _.assign((ctx) => _.reduce(
    _.defaults(defaults, ctx),
    (result, value, key) => _.replace(result, RegExp(`{${key}}`, 'i'), value),
    source
  ), {source, isTemplate: true});
};

/**
 *
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

  let {status = 422, error = 'ValidationError', path = '#', ...rest} = Object(ctx);

  Error.call(this);
  if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  else this.stack = (new Error).stack;

  _.assign(this, {
    name: error, status, path,
    message: err(msg)({path, ...rest})
  });
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = Error;
ValidationError.prototype.class = ValidationError;

module.exports = {
  ValidationError,
  err
};
