function Any(value) {
  if (!(this instanceof Any)) return new Any(value);
  this.value = value;
}

Any.toJSON = () => '*';

Any.prototype.valueOf = Any.prototype.toJSON = function () {
  return this.value;
};

function Nil() {}

Nil.toJSON = () => 'null';

Nil.prototype.valueOf = Nil.prototype.toJSON = function () {
  return null;
};

module.exports = {
  Any,
  Nil
};