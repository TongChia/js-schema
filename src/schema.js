import _ from 'lodash';

const clusterID = _.random(0, 0xff);
let instanceID = 0, classID = 0;

const getTypeOf = (value) => {
  const type = Object.prototype.toString.call(value);
  return type.substr(8, type.length - 9).toLowerCase();
};

const genId = () => _.join(_.map([clusterID, classID, instanceID++], id => id.toString(16)), '-');

export default class Schema {

  static validates = {};

  static fn (keyword, describe) {
    if (_.isFunction(describe)) return this.fn(keyword, {validator: describe});
    if (!_.isEmpty(describe)) this.validates[keyword] = describe;
    this.prototype[keyword] = function (...params) {
      return this.division(keyword, ...params);
    };
    return this;
  }

  config = {};
  raw = {};
  _id;
  $id;

  constructor(config = {}) {
    _.assign(this.config, config);
    this._id = genId();
  }

  #clone () {
    return _.assign(_.create(Object.getPrototypeOf(this)), this, {_id: genId()});
  }

  set (key, value) {
    _.set(this.raw, key, value);
    return this;
  }

  get (key) {
    return _.get(this.raw, key);
  }

  division (keyword, value, message) {
    const clone = this.#clone().set(keyword, value);
    if (message) clone.set(['errorMessage', keyword], value);
    return clone;
  }

  isValid(value, config, callback) {

    const conf = _.defaults(options, this.config);
    const {promise, returnErrors} = conf;
    const valueType = getTypeOf(value);
    const validType = this.raw.type;
    const validates = this.constructor.validates;
    const errors = [];
    const isAsync = callback || promise;

    if (validType && (valueType !== validType)) {

    }

    for (const keyword of this.raw) {
      if (_.has(validates, keyword)) {
        const {validator} = validates[keyword];
        const param = this.raw[keyword];

        if (validator && !validator(value, param, this.raw, conf)) {
          if (returnErrors) {
            errors.push(_.defaultTo(_.get(this.raw, ['errorMessage', keyword]), 'error message'))
          } else {
            return false;
          }
        }
      }
    }

    if (!isAsync)
      return returnErrors ? errors : true;

    if (callback) {

    }

    return errors;

  }

}
