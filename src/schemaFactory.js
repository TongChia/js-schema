const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const {ValidationError} = require('./error');

module.exports = function (type, checker) {

  function Schema (definitions = {}, annotations = {}) {
    if (!new.target) return new Schema(definitions, annotations);
    this._ = definitions;
    this.$ = annotations;
  }

  Schema.validates = {};

  _.merge(Schema.prototype, {
    class: Schema,

    toJSON: function () {
      return _.mapValues(this._, _.first);
    },

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
        const params = this._[keyword],
          {isAsync, validator, message} = Schema.validates[keyword];

        if (isAsync) return validator(value, ...params, cb);
        if (validator(value, ...params)) return cb();

        return cb(new ValidationError(
          _.get(this, ['$', 'messages', keyword]) || message,
          {value, params, keyword, type}
        ));
      }, (err) => callback(err, value));
    }
  });

  return _.assign(new Schema({type}), {
    original: true,

    protoMethod: function (prop, method) {
      Schema.prototype[prop] = method;
      return this;
    },

    addKeyword: function (keyword, ...defaultParams) {
      return this.protoMethod(keyword, function (...params) {
        if (_.get(_.last(params), 'isTemplate'))
          _.set(this, ['$', 'messages', keyword], params.pop());
        return new Schema({...this._, [keyword]: _.merge([], defaultParams, params)}, this.$);
      });
    },

    addValidate: function (keyword, validate, msg) {
      const {isAsync, message = msg, validator = validate} = validate;
      _.merge(Schema.validates, {[keyword]: _.omitBy({validator, message, isAsync}, _.isUndefined)});
      return this.addKeyword(keyword);
    }
  });

};
