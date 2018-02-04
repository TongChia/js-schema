import _ from './utils';
import {simpleTypeDic} from './TypeDictionary';

export default class Schema {

  constructor(define) {

    if (!new.target) return new Schema(define);

    if (_.isArray(define)) return Error('not support yet');

    if (!_.isObject(define)) return new Schema({type: define});

    if (Schema.Types.has(define.type))
      _.assign(this, define, {type: Schema.Types.get(define.type)});

    else
      throw TypeError()
  }

}

Schema.Types = simpleTypeDic;
