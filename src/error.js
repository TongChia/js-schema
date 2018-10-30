const _ = require('lodash');

function ValidationError (msg, ctx) {
  if (!new.target) return new ValidationError(message, ctx);

  Error.call(this);
  if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  else this.stack = (new Error).stack;

  ctx = {params: [], ...ctx};
  this.name = 'ValidationError';
  this.message = _.template(msg)(ctx);
  this.status = 422;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = Error;

module.exports = ValidationError;
