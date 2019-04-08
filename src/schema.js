import _ from 'lodash';
import {interKeys, getTypeOf, isAsyncFunction} from './utils';
import {ValidationError} from "./error";

const clusterID = _.random(0, 0xff);
let instanceID = 0, classID = 0;

const genId = () => _.join([
  _.padStart(clusterID.toString(16), 2, '0'),
  _.padStart(classID.toString(16), 2, '0'),
  _.padStart((instanceID++).toString(16), 4, '0'),
], '-');

class Schema {

  static validates = {};

  static fn (keyword, describe) {
    if (_.isFunction(describe))
      return this.fn(keyword, isAsyncFunction(describe) ? {asyncValidator: describe} : {validator: describe});

    const {validator, asyncValidator, defaultParameter} = describe;
    if (validator || asyncValidator)
      this.validates[keyword] = describe;

    this.prototype[keyword] = function (value, ...params) {
      return this.division(keyword, _.defaultTo(value, defaultParameter), ...params);
    };
    return this;
  }

  //TODO: create new class;
  static plugin ({validates}) {
    _.each(validates, (rest, type) => {
      _.each(rest, (describe, keyword) => this.fn(keyword, _.merge(describe, {valueType: type})))
    });
    classID++;
    return Schema;
  }

  config = {};
  raw = {};
  _id;
  $id;

  constructor(config = {}) {
    _.assign(this.config, config);
    this._id = genId();
  }

  set (key, value) {
    _.set(this.raw, key, value);
    return this;
  }

  get (key) {
    return _.get(this.raw, key);
  }

  division (keyword, value, message) {
    const clone = _.assign(_.create(Object.getPrototypeOf(this)), this, {_id: genId()});
    clone.set(keyword, value);
    if (message) clone.set(['errorMessage', keyword], value);
    return clone;
  }

  type = (param, message) => this.division('type', param, message);

  #getErrorMessage (keyword) {
    return _.get(this.raw, ['errorMessage', keyword]) ||
      _.get(this.constructor.validates, [keyword, 'errorMessage']) ||
      _.get(this.config, 'generalErrorMessage')
  };

  #getValidationResult (value, keyword, config, isAsync) {
    const definitions = this.raw;
    const param = definitions[keyword];
    const {
      validator,
      asyncValidator,
      promise = getTypeOf(asyncValidator) === 'asyncFunction'
    } = this.constructor.validates[keyword];

    if (isAsync && asyncValidator) {
      if (promise) return asyncValidator(value, param, config, definitions);
      return new Promise((resolve, reject) =>
        asyncValidator(value, param, (err, ...others) => err ? reject(err) : resolve(...others), config, definitions))
    }
    return validator(value, param, config, definitions)
  }

  #validateSync (value, config) {
    const {fuse = true, returnError = false} = config;
    const validates = this.constructor.validates;
    const definitions = this.raw;
    const keys = interKeys(validates, definitions);
    const errs = [];

    for (const keyword of keys) {
      if (!this.#getValidationResult(value, keyword, config, false)) {
        if (!returnError) return false;
        const error = this.#getErrorMessage(keyword);
        if (fuse) return error;
        errs.push(error);
      }
    }

    return returnError ? fuse ? null : errs : true;
  }

  async #validateAsync (value, config) {
    const {fuse = false, returnError = true} = config;
    const validates = this.constructor.validates;
    const definitions = this.raw;
    const keys = interKeys(validates, definitions); //TODO: check value type;
    const errs = [];

    for (const keyword of keys) {
      let err;
      try {
        const result = await this.#getValidationResult(value, keyword, config, true);
        if (result instanceof Error) err = result;
        if (result === false) err = this.#getErrorMessage(keyword);
      } catch (e) {
        if (e instanceof ValidationError) err = e;
        else throw e;
      }
      if (err) {
        if (!returnError) return false;
        if (fuse) throw err;
        errs.push(err);
      }
    }

    if (!returnError) return true;
    if (!_.isEmpty(errs)) throw errs;
    return value;
  }

  isValid (value, config, callback) {

    if (_.isFunction(config)) return this.isValid(value, {}, config);
    if (callback) return this.isValid(value, _.merge(config, {promise: true, returnErrors: true}))
      .then((result) => callback(null, result)).catch((err) => callback(err));

    const conf = _.defaults(config, this.config);
    const {fuse, promise, returnErrors} = conf;
    const valueType = getTypeOf(value);
    const validType = this.raw.type || 'any';

    // TODO: return type error;
    if ((validType !== 'any') && (valueType !== validType)) {
      let err = returnErrors ? 'type error' : false;
      if (!fuse) err = [err];
      return promise ? Promise.reject(err) : err;
    }

    return promise ?
      this.#validateAsync(value, config) :
      this.#validateSync(value, config);
  }
}

export default Schema;
