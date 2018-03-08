"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Any = Any;

function Any(value) {
  if (!(this instanceof Any)) return new Any(value);
  this.value = value;
}

Any.toJSON = () => '*';

Any.prototype.valueOf = Any.prototype.toJSON = function () {
  return this.value;
};