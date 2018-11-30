const _ = require('lodash');
const {_schema} = require('./schema');

const parse = function (json) {
  if (_.isString(json)) return parse(JSON.parse(json));
  if (_.isBoolean(json)) return _schema(json);

  let {_js_type : type = json.type, ...others} = json;

  return _schema(type || 'any').division(_.mapValues(others, (define, keyword) =>
    _.eq(keyword, 'items') ?
      _.isArray(define) ?
        _.mapValues(define, parse) :
        parse(define) :
      _.includes(['propertyNames', 'additionalProperties', 'additionalItems'], keyword) ?
        parse(define) :
        _.includes(['properties', 'patternProperties'], keyword) ?
          _.mapValues(define, parse) :
          define
  ));
};

module.exports = {parse};
