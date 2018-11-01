const _ = require('lodash');
const $ = require('async');
const {_keys} = require('./utils');
const VError = require('./error');

module.exports = function (typeName, checker) {

  function Schema (val) {
    if (!new.target) return new Schema(val);
    this._ = val;
  }

  Schema.validates = {};

  Object.defineProperties(Schema.prototype, {

    'class': {get: () => Schema},

    toJSON: {value: function (version) {
      if (version) return {};
      return this._;
    }},

    isValid: {value: function (val, callback) {
      if (checker && !checker(val))
        return callback(new TypeError(`Invalid value for ${typeName}.`), val);

      $.each(_keys(Schema.validates, this._), (k, cb) => {
        const params = this._[k],
          {isAsync, validator, message} = Schema.validates[k],
          msg =
            (params.length - validator.length) > (isAsync ? 1 : 2) &&
            _.isString(_.last(params)) &&
            params.pop();

        if (isAsync) return validator(val, ...params, cb);
        if (validator(val, ...params)) return cb();
        return cb(new VError(msg || message, {params, keyword: k, typeName}));

      }, (err) => callback(err, val));
    }},

    addKeyword: {value: function (keyword) {
      Schema.prototype[keyword] = function (...params) {
        return new Schema({...this._, [keyword]: params});
      };

      return this;
    }, enumerable: false},

    addValidate: {value: function (keyword, validate, msg) {
      const {
        isAsync,
        validator = validate,
        message = msg || `Invalid value for ${typeName}.${keyword}(<%=params%>)`
      } = validate;

      _.merge(Schema.validates, {[keyword]: {validator, message, isAsync}});

      return this.addKeyword(keyword);
    }, enumerable: false}
  });

  return new Schema({type: typeName});

};
