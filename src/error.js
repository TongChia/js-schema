const _ = require('lodash');

const errMsgWrapper = (msg) => (ctx) => (_.get(msg, 'raw.0') || msg).replace();

// TODO: as tag template. ex: err`data should <= 3`
function ValidationError (msg, ctx, ...rest) {
  // if (msg.raw) return errMsgWrapper(msg, ctx, ...rest);
  if (!new.target) return new ValidationError(msg, ctx);

  Error.call(this);
  if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  else this.stack = (new Error).stack;

  this.name = 'ValidationError';
  this.message = _.template(msg)({params: [], path: 'value', keyword: '', ...ctx});
  this.status = 422;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = Error;
ValidationError.prototype.class = ValidationError;

module.exports = ValidationError;
