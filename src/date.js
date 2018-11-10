const _ = require('lodash');
const createSchema = require('./schemaFactory');
const {toJSON} = require('./utils');

const date = createSchema('date', _.isDate);

// to date;
const _d = (d) => (d === 'now' || _.isUndefined(d)) ? Date.now() : new Date(d);

_.each(
  {
    before: (v, date) => _.lte(v, _d(date)),
    after:  (v, date) => _.gte(v, _d(date)),
  },
  (validate, keyword) => date.addValidate(keyword, validate)
);

date.protoMethod('toJSON', function () {
  return {type: 'string', format: 'date-time', '$js-schema$': toJSON.call(this)};
});

module.exports = {date};
