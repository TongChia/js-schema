const _ = require('lodash');
const $ = require('async');
const {_keys, toJSON} = require('./utils');
const {ValidationError} = require('./error');

module.exports = function (type, checker) {

  function Schema (definitions = {}) {
    if (!new.target) return new Schema(definitions);
    this._ = definitions;
  }

  Schema.validates = {};

  _.merge(Schema.prototype, {
    class: Schema,

    toJSON,

    isTyped: checker || _.constant(true),

    isValid: function (value, callback) {
      if (!callback && !_.eq(typeof Promise, 'undefined'))
        return new Promise((resolve, reject) =>
          this.isValid(value, (err) => err ? reject(err) : resolve(value))
        );

      if (!this.isTyped(value))
        return callback(new ValidationError(
          '{value} should instance of {type}.',
          {type, value, error: 'TypeError'}
        ), value);

      $.each(_keys(Schema.validates, this._), (keyword, cb) => {
        const [params, customMsg] = this._[keyword],
          {isAsync, validator, message} = Schema.validates[keyword];

        if (isAsync) return validator(value, params, cb);
        if (validator(value, params)) return cb();

        return cb(new ValidationError(customMsg || message, {value, params, keyword, type}));
      }, (err) => callback(err, value));
    }
  });

  let schema = _.assign(new Schema({type}), {
    original: true,

    protoMethod: function (prop, method) {
      Schema.prototype[prop] = method;
      return this;
    },

    addKeyword: function (keyword, defaults) {
      return this.protoMethod(keyword, function (params, message) {
        return new Schema({...this._, [keyword]: [_.defaultTo(params, defaults), message]});
      });
    },

    addValidate: function (keyword, validate, msg) {
      const {isAsync, message = msg, validator = validate, defaults} = validate;
      _.set(Schema.validates, keyword, _.omitBy({validator, message, isAsync}, _.isUndefined));
      return this.addKeyword(keyword, defaults);
    }
  });

  _.each(['title', 'description', 'examples', 'default'], (k) => schema.addKeyword(k));

  return schema;
};
