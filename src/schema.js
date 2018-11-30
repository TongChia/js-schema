const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./keywords');
const {ValidationError, messages} = require('./error');

const STORE = new Map;
const JSON_TYPE = ['string', 'number', 'boolean', 'null', 'array', 'object'];

/* eslint-disable indent */
const _schema = (s) =>
  s === undefined ? STORE.get('any') :
  s === true      ? STORE.get('any') :
  s === false     ? STORE.get('none') :
  _.isString(s)   ? STORE.get(s) :
  _.isArray(s)    ? STORE.get('array').reduce(s.length > 1 ? s : s[0]) :
  _.isObject(s)   ? s.isSchema ? s : STORE.get('object').properties(s) :
  s;
/* eslint-enable indent */

const toJSON = function () {
  let {type, ...json} = this._;
  return ({
    [JSON_TYPE.includes(type) ? 'type' : '_js_type']: type,
    ...json
  });
};

const toString = function () {
  let keys = _.pull(_.keys(this._), 'type');
  return 'schema:' + this._.type + (keys.length ? '.' : '') +
    keys.splice(0, 3).map(k => (
      k + '(' + (_.isArray(this._[k]) ? '[...]' : _.isObject(this._[k]) ? '{...}' : this._[k]) + ')'
    )).join('.') + (keys.length ? '...' : '') ;
};

/**
 * create Schema constructor.
 * @param type {string}
 * @param checker? {Function}
 * @return {function}
 */
function createSchema (type, checker) {

  /**
   * Schema constructor.
   * @param {Object} definitions
   * @param {string} definitions.type
   * @return {Schema}
   * @class
   */
  function Schema (definitions = {}) {
    if (!new.target) return new Schema(definitions);
    this._ = definitions;
  }

  Schema.validates = {};

  const proto = _.assign(Schema.prototype, {
    isSchema: true,

    class: Schema,

    toJSON, toString,

    // valueOf () {return this._},

    isTyped: checker || _.stubTrue,

    /**
     * set schema instance property.
     * @param {string|string[]} key
     * @param value
     * @return {Schema}
     */
    set (key, value) {
      _.set(this._, key, value);
      return this;
    },

    /**
     * get schema instance property.
     * @param {string|string[]} key
     * @return {*}
     */
    get (key) {
      return _.get(this._, key);
    },

    has (key) {
      return _.has(this._, key);
    },

    division (variation = {}) {
      return new Schema({...this._, ...variation});
    },

    /**
     * verify `value` is valid for this schema instance.
     * @param value
     * @param {Schema~isValidCallback} callback
     * @return {*}
     */
    isValid (value, callback) {
      if (!callback && !_.eq(typeof Promise, 'undefined'))
        return new Promise((resolve, reject) => this.isValid(value, (err, result) => err ? reject(err) : resolve(result)));

      if (!this.isTyped(value))
        return callback(new ValidationError(messages.typeError, {type, value, errorType: 'TypeError'}), value);

      return $.each(_keys(Schema.validates, this._), (keyword, cb) => {
        const params = this._[keyword], {isAsync, validator, message} = Schema.validates[keyword];

        if (isAsync) return validator.call(this, value, params, cb);
        if (validator.call(this, value, params)) return cb();

        return cb(new ValidationError(this.get(['errorMessage', keyword]) || message, {value, params, keyword, type}));
      }, (err) => callback(err, value));
    }

    /**
     * isValid callback.
     * @callback Schema~isValidCallback
     * @param {?Error} error
     * @param value
     */
  });

  let schema = _.assign(new Schema({type}), {
    original: true,

    proto (prop, method) {
      if (arguments.length === 1) return proto[prop];
      proto[prop] = method;
      return this;
    },

    hook (prop, fn) {
      const old = this.proto(prop);
      return this.proto(prop, function (...rest) {
        return fn.call(this, _.bind(old, this), ...rest);
      });
    },

    addKeyword (keyword, defaults) {
      const def = _.clone(defaults);
      return this.proto(keyword, function (params, message) {
        const schema = this.division({[keyword]: _.defaultTo(params, def)});
        if (message) schema.set(['errorMessage', keyword], message);
        return schema;
      });
    },

    addValidate (keyword, validate, msg) {
      const {isAsync, message = msg, validator = validate, defaults} = validate;
      _.set(Schema.validates, keyword, _.omitBy({validator, message, isAsync}, _.isUndefined));
      return this.addKeyword(keyword, defaults);
    }
  });

  _.each(['title', 'description', 'examples', 'default', '$comment'], (k) => schema.addKeyword(k));

  STORE.set(type, schema);

  return schema;
}

module.exports = {
  _schema,
  createSchema,
  toJSON
};
