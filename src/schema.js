const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const {ValidationError, messages} = require('./error');

const version = '0.2';

const stores = new Map;

const $schema = (s) =>
  s.isSchema ? s :
    s === true ? stores.get('*') :
      s === false ? stores.get('none') :
        _.isPlainObject(s) ? stores.get('object').properties(s) :
          _.isArray(s) ? stores.get('array').items(s.length > 1 ? s : s[0]) :
            s;

// TODO: ↓
// const toSchema = function (schema) {
//
// };

const toJSON = function () {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $js_schema: version,
    ...this._,
  };
};

const toString = function () {
  let keys = _.pull(_.keys(this._), 'type');
  return 'schema:' + this._.type + (keys.length ? '.' : '') +
    keys.splice(0, 3).map(k => (k + '(' +
      (_.isObjectLike(this._[k]) ? '...' : this._[k]) +
      ')')).join('.') +
    (keys.length ? '...' : '') ;
};

/**
 * create Schema constructor.
 * @param type {string}
 * @param checker {?function}
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
      return _.set(this._, key, value);
    },

    /**
     * get schema instance property.
     * @param {string} key
     * @return {*}
     */
    get (key) {
      return _.get(this._, key);
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

        return cb(new ValidationError(_.get(this._, ['errorMessage', keyword]) || message, {value, params, keyword, type}));
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
        const schema = new Schema({...this._, [keyword]: _.defaultTo(params, def)});
        if (message) _.set(schema._, ['errorMessage', keyword], message);
        return schema;
      });
    },

    addValidate (keyword, validate, msg) {
      const {isAsync, message = msg, validator = validate, defaults} = validate;
      _.set(Schema.validates, keyword, _.omitBy({validator, message, isAsync}, _.isUndefined));
      return this.addKeyword(keyword, defaults);
    }
  });

  _.each(['title', 'description', 'examples', 'default'], (k) => schema.addKeyword(k));

  stores.set(type, schema);

  return schema;
}

module.exports = {
  stores,
  $schema,
  createSchema,
  toJSON,
};
