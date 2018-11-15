const _ = require('lodash');

const messages = {
  defaults     : '`{value}` should valid for schema:{type}:{keyword}({params}).',
  typeError    : '`{value}` should instance of {type}.',
  itemError    : '`tuple`[{path}] should valid for schema:array:items ( {error.message} ).',
  listError    : '`list` should valid for schema:array:items[{path}] ( {error.message} ).',
  containsError: '',
  propertyError: 'Invalid value for object.properties[{path}] ( {error.message} ).',
};

const err = (template, defaults) => {
  if(_.get(template, 'isTemplate')) return template;

  let source  = _.trim(_.join(template, '')) || messages.defaults;
  let reserve = _.clone(defaults);

  return _.assign((context) => {
    let ctx = _.defaults(context, reserve);

    return _.reduce(
      source.match(/(?<={)[^{^}]+(?=})/g),
      (result, req) => _.replace(result,
        RegExp('{' + req + '}', 'i'),
        _.has(ctx, req) ? _.get(ctx, req) : '?' + req
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
  messages,
  err
};
