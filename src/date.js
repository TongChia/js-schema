const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');
const {formats} = require('./formats');

const date = createSchema('date', (date) => (_.isDate(date) && !_.isNaN(date.getTime())));

// to date;
const _d = (d) => (d === 'now' || _.isUndefined(d)) ? Date.now() : new Date(d);

_.each(
  {
    before: (v, date) => _.lte(v, _d(date)),
    after:  (v, date) => _.gte(v, _d(date)),
  },
  (validate, keyword) => date.addValidate(keyword, validate)
);

date.superMethod('toJSON', function () {
  let {type, $js_schema, ...json} = toJSON.call(this);
  return {...json, $js_schema: {...$js_schema, type}, type: 'string', format: 'date-time'};
});

date.addKeyword('RfCString', true);

const isValid = date.class.prototype.isValid;
date.superMethod('isValid',
  function (value, callback) {
    if (this.get('RfCString') && _.isString(value) && (formats.date(value) || formats['date-time'](value)))
      value = new Date(value);
    return isValid.call(this, value, callback);
  }
);

module.exports = {date};
