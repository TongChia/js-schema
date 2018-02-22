import {isArray, isObject, assign} from './utils';
import {simpleTypeDic} from './TypeDictionary';

export default function Schema (define) {

  if (!new.target) return new Schema(define);

  if (isArray(define)) return Error('not support yet');

  if (!isObject(define)) return new Schema({type: define});

  if (Schema.Types.has(define.type))
    assign(this, define, {type: Schema.Types.get(define.type)});

  else
    throw TypeError()


}

// Object.defineProperty(Schema.prototype, 'keys', {
//   enumerable: true,
//   configurable: true,
//   get: function () {
//     return Object.keys(this);
//   }
// });

const prototypes = {
  typeValidate: function (v) {

  },
  validates: function () {
  },
  keys: function () {
    return Object.keys(this);
  }
};

const handler = {
  get: function (target, prop) {
    if (prop in target) return target[prop]
  }
};

Schema.prototype = new Proxy(assign(Schema.prototype, prototypes), handler);

Schema.Types = simpleTypeDic;
