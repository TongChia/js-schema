function Any(value) {
  if (!(this instanceof Any)) return new Any(value);
  this.value = value;
}

Any.toJSON = () => '*';

Any.symbol = Symbol('any');

Any.prototype.valueOf = Any.prototype.toJSON = function () {
  return this.value;
};

function Nil() {
  if (!(this instanceof Nil)) return new Nil();
}

Nil.toJSON = () => 'nil';

Nil.symbol = Symbol('nil');

Nil.prototype.valueOf = Nil.prototype.toJSON = function () {
  return null;
};

module.exports = {
  Any,
  Nil
};