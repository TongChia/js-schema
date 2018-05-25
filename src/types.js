function Any (value) {
  if(!(this instanceof Any)) return new Any(value);

  this.value = value;
}
Any.toJSON = () => '*';

Any.prototype.valueOf =
Any.prototype.toJSON = function () {
  return this.value;
};

class ValidationError extends Error {

  constructor(message, errors, ...others) {
    super(message, ...others);
    // TODO: optimize errors;
    if (errors) this.errors = errors;
    this.code = 400;
  }
}

// export function ValidationError (message, errors) {
//   if (!new.target) return new ValidationError(message, errors);
//   this.constructor.prototype.__proto__ = Error.prototype;
//   Error.call(this);
//   this.message = message;
//   if (errors) this.errors = errors;
//   if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
//   else this.stack = (new Error).stack;
// }

module.exports = {Any, ValidationError};
