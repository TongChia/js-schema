const {isError, template} = require('./utils');
const Sugar = require('sugar');
const util = require('util');

function Any (value) {
  if(!(this instanceof Any)) return new Any(value);

  this.value = value;
}
Any.toJSON = () => '*';

Any.prototype.valueOf =
Any.prototype.toJSON = function () {
  return this.value;
};

function ValidationError (message, ctx) {

  if (!new.target) {
    if (isError(message)) return message;
    if (Sugar.Object.isEmpty(message)) return null;
    return new ValidationError(message, ctx);
  }

  Error.call(this);
  if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  else this.stack = (new Error).stack;

  ctx = {path: '/', title: 'variable', valid: 'validate', ...ctx};
  this.type = ctx.error || 'ValidationError';
  this.status = ctx.status || 400;
  this.message = template(message, ctx);

}

ValidationError.concatError = function (...errors) {
  errors = errors.filter(error => isError(error));
  if (errors.length > 1)
    return Object.assign(new ValidationError('Multiple errors'), {errors});
  if (errors.length === 1)
    return errors[0]
};

ValidationError.multipleError = function (errors, ctx) {
  let {filter, map, size} = Sugar.Object;
  let errs = filter(map(errors, ValidationError), err => err);

  if (!size(errs)) return null;

  let err = new ValidationError('errors', ctx);
  err.type = 'MultipleError';
  err.errors = errs;

  return err;
};

Object.defineProperties(ValidationError.prototype, {
  name: {
    get: () => 'ValidationError'
  },
  [Symbol.toStringTag]: {
    get: () => 'Error'
  }
});

util.inherits(ValidationError, Error);

module.exports = {/*Any, */ValidationError};
