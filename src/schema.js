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

  #getError (keywords, value, config) {
    const {returnError} = config;
    const errors = keywords.map((keyword) => ValidationError(
      _.get(this.raw, ['errorMessage', keyword]) ||
      _.get(this.constructor.validates, [keyword, 'errorMessage']) ||
      _.get(this.config, 'generalErrorMessage'),
      {value, ...config}
    ));
    return returnError ? ValidationError('', {errors}) : _.isEmpty(errors)
  }

  /**
   * check value is valid by call the validator which found by keyword.
   * @return {boolean|Promise<any>}
   */
  #getValidationResult (value, keyword, config, valueType, isAsync) {
    const definitions = this.raw;
    const param = definitions[keyword];
    const {
      validator,
      asyncValidator,
      targetType,
      promise = getTypeOf(asyncValidator) === 'asyncFunction'
    } = this.constructor.validates[keyword];

    if (targetType && targetType !== valueType) return true;

    if (isAsync && asyncValidator) {
      if (promise) return asyncValidator(value, param, config, definitions);
      return new Promise((resolve, reject) =>
        asyncValidator(value, param, (err, ...others) => err ? reject(err) : resolve(...others), config, definitions))
    }
    return validator(value, param, config, definitions)
  }

  #getValidType (value, config) {
    const valueType = getTypeOf(value);
    if (this.raw.type === valueType) {
      return valueType;
    }
  }

  validateSync (value, config) {
    const conf = _.defaults(config, {returnError: false, multiError: false});
    const fuse = !conf.returnError || !conf.multiError;
    const errs = [];
    const type = this.#getValidType(value);

    if (!type) {
      errs.push('type');
    } else {
      for (const keyword of _.keys(this.raw)) {
        if (!this.#getValidationResult(value, keyword, conf, type)) {
          errs.push(keyword);
          if (fuse) break;
        }
      }
    }

    return this.#getError(errs, conf);
  }

  async validate (value, config) {
    const conf = _.defaults(config, {returnError: true, multiError: true});
    const fuse = !conf.returnError || !conf.multiError;
    const errs = [];
    const type = this.#getValidType(value);

    if (!type) {
      errs.push('type');
    } else {
      for (const keyword of _.keys(this.raw)) {
        let err;
        try {
          const result = await this.#getValidationResult(value, keyword, config, validType, true);
          if (result instanceof Error) err = result;
          if (result === false) err = keyword;
        } catch (e) {
          if (e instanceof ValidationError) err = e;
          else throw e;
        }
        if (err) {
          errs.push(err);
          if (fuse) break;
        }
      }
    }

    return this.#getError(errs, config);
  }

  isValid (value, config, callback) {
    if (_.isFunction(config)) return this.isValid(value, {}, config);
    if (callback) return this.isValid(value, _.merge(config, {promise: true}))
      .then((result) => callback(result)).catch((err) => callback(err));

    const conf = _.defaults(config, this.config);

    return (conf.promise ? this.validate : this.validateSync)(value, conf);
  }
}

export default Schema;
