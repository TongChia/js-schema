import _ from 'lodash';
import {getTypeOf, isAsyncFunction, validatorPromisify} from './utils';
import {ValidationError} from "./error";

const clusterID = _.random(0, 0xff);
let instanceID = 0, classID = 0;

const genId = () => _([clusterID, classID, instanceID++]).map(n => _.padStart(n.toString(16), 4, '0')).join('-');

class Schema {

  static validates = {};

  static fn (keyword, describe) {
    if (_.isFunction(describe))
      return this.fn(keyword, {[isAsyncFunction(describe) ? 'asyncValidator' : 'validator']: describe});

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
    _.each(validates, (rest, type) =>
      _.each(rest, (describe, keyword) =>
        this.fn(keyword, _.merge(describe, {targetType: type}))));
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
    const errors = keywords.map((keyword) => ValidationError(
      _.get(this.raw, ['errorMessage', keyword]) ||
      _.get(this.constructor.validates, [keyword, 'errorMessage']) ||
      _.get(this.config, 'generalErrorMessage'),
      {value, ...config}
    ));
    return ValidationError('', {errors})
  }

  /**
   * check value is valid by call the validator which found by keyword.
   * @return {boolean|Promise<any>}
   */
  #getValidationResult (value, keyword, config, valueType, isAsync) {
    const definitions = this.raw;
    const {
      validator: syncValidator, asyncValidator, targetType,
      promise = isAsyncFunction(asyncValidator)
    } = this.constructor.validates[keyword];

    if (targetType && targetType !== valueType) return true;

    const validator = (isAsync && asyncValidator) ? promise ?
      asyncValidator : validatorPromisify(asyncValidator) : syncValidator || _.stubTrue;

    return validator(value, definitions[keyword], config, definitions);
  }

  #getValidType (value, config) {
    const valueType = getTypeOf(value);
    if (this.raw.type === valueType) {
      return valueType;
    }
  }

  validateSync (value, config) {
    const conf = _.defaults(config, this.config);
    const type = this.#getValidType(value);
    const errs = [];

    if (!type) {
      errs.push('type');
    } else {
      for (const keyword of _.keys(this.raw)) {
        if (!this.#getValidationResult(value, keyword, config, type)) {
          errs.push(keyword);
          if (!conf.multiError) break;
        }
      }
    }

    return this.#getError(errs, config);
  }

  async validate (value, config) {
    const conf = _.defaults(config, this.config);
    const type = this.#getValidType(value);
    const errs = [];

    if (!type) {
      errs.push('type');
    } else {
      for (const keyword of _.keys(this.raw)) {
        let err;
        try {
          const result = await this.#getValidationResult(value, keyword, config, type, true);
          if (result instanceof Error) err = result;
          if (result === false) err = keyword;
        } catch (e) {
          if (e instanceof ValidationError) err = e;
          else throw e;
        }
        if (err) {
          errs.push(err);
          if (!conf.multiError) break;
        }
      }
    }

    return this.#getError(errs, conf);
  }

  isValid (value, config, callback) {
    if (_.isFunction(config)) return this.isValid(value, {}, config);
    const _config = _.merge(config, {multiError: false});
    if (callback)
      return this.validate(value, _config)
        .then(result => callback(null, _.isNull(result)), err => callback(err));

    return _.isNull(this.validateSync(value, _config));
  }
}

export default Schema;
