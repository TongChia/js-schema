export function Any (value) {
  if(!(this instanceof Any)) return new Any(value);

  this.value = value;
}
Any.toJSON = () => '*';

Any.prototype.valueOf =
Any.prototype.toJSON = function () {
  return this.value;
};

export class ValidationError extends Error {

  constructor(message, errors) {
    super(message);
    this.errors = errors;
  }
}

ValidationError.prototype.name = 'ValidationError';
