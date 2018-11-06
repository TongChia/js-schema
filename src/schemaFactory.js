const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const VError = require('./error');

module.exports = function (type, checker) {

  function Schema (definitions, annotations) {
    if (!new.target) return new Schema(definitions, annotations);
    this._ = definitions;
    this.$ = annotations;
  }

  Schema.validates = {};

  _.merge(Schema.prototype, {

    'class': Schema,

    toJSON: function () {
      return _.mapValues(this._, _.first);
    },

    isTyped: checker || _.constant(true),

    isValid: function (val, callback) {
      if (!callback) return new Promise((resolve, reject) =>
        this.isValid(val, (err) => err ? reject(err) : resolve(val)));

      if (!this.isTyped(val)) return callback(new TypeError(`Invalid value for ${type}.`), val);

      $.each(_keys(Schema.validates, this._), (keyword, cb) => {
        const params = this._[keyword],
          {isAsync, validator, message} = Schema.validates[keyword],
          msg = _.get(params, [params.length - 1, 'name']) === 'errMsgWrapper' && params.pop();

        if (isAsync) return validator(val, ...params, cb);
        if (validator(val, ...params)) return cb();
        return cb(new VError(msg || message, {params, keyword, type}));

      }, (err) => callback(err, val));
    }
  });

  return _.merge(new Schema({type}), {
    original: true,

    protoMethod: function (prop, method) {
      Schema.prototype[prop] = method;
      return this;
    },

    addKeyword: function (keyword) {
      return this.protoMethod(keyword, function (...params) {
        return new Schema({...this._, [keyword]: params}, this.$);
      });
    },

    addValidate: function (keyword, validate, msg) {
      const {isAsync, message = msg, validator = validate} = validate;
      _.merge(Schema.validates, {[keyword]: _.omitBy({validator, message, isAsync}, _.isUndefined)});
      return this.addKeyword(keyword);
    }
  });

};
