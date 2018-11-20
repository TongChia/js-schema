const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const {ValidationError, messages} = require('./error');

const version = '0.2';

const store = {};

// const schema = (...rest) => {
//   rest = _.flatten(rest);
//
//   const [title, ...others] = rest;
//
//   if (_.isString(title)) {
//     return _.get(store, rest[0]);
//   }
// };

// TODO: ↓
// const toSchema = function (schema) {
//
// };

const toJSON = function () {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $js_schema: {version},
    ...this._,
  };
};

const toString = function () {
  let keys = _.pull(_.keys(this._), 'type');
  return 'schema:' + this._.type + (keys.length ? '.' : '') +
    keys.splice(0, 3).map(k => (k + '(' + this._[k] + ')')).join('.') +
    (keys.length ? '...' : '') ;
};

function createSchema (type, checker) {

  function Schema (definitions = {}) {
    if (!new.target) return new Schema(definitions);
    this._ = definitions;
  }

  Schema.validates = {};

  _.merge(Schema.prototype, {
    class: Schema,

    toJSON, toString,

    valueOf () {return this._},

    isTyped: checker || _.stubTrue,

    set (key, value) {
      return _.set(this._, key, value);
    },

    get (key) {
      return _.get(this._, key);
    },

    $title (title) {
      if (!_.trim(title))
        return new RangeError('title');
      if (_.has(store, title))
        return new Error('');

      this._.title = title;
      store[title] = this;

      return this;
    },

    isValid (value, callback) {
      if (!callback && !_.eq(typeof Promise, 'undefined'))
        return new Promise((resolve, reject) => this.isValid(value, (err, result) => err ? reject(err) : resolve(result)));

      if (!this.isTyped(value))
        return callback(new ValidationError(messages.typeError, {type, value, errorType: 'TypeError'}), value);

      $.each(_keys(Schema.validates, this._), (keyword, cb) => {
        const params = this._[keyword], {isAsync, validator, message} = Schema.validates[keyword];

        if (isAsync) return validator.call(this, value, params, cb);
        if (validator.call(this, value, params)) return cb();

        return cb(new ValidationError(_.get(this._, ['errorMessage', keyword]) || message, {value, params, keyword, type}));
      }, (err) => callback(err, value));
    }
  });

  let schema = _.assign(new Schema({type}), {
    original: true,

    superMethod (prop, method) {
      // if (arguments.length === 1) return this.prototype[prop];
      Schema.prototype[prop] = method;
      return this;
    },

    addKeyword (keyword, defaults) {
      let def = _.clone(defaults);
      return this.superMethod(keyword, function (params, message) {
        let schema = new Schema({...this._, [keyword]: _.defaultTo(params, def)});
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

  return schema;
}

module.exports = {
  createSchema,
  toJSON,
};
