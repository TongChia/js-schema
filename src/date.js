const _ = require('lodash');
const {createSchema, toJSON} = require('./schema');
const {formats} = require('./formats');

const date = createSchema('date', (d) => (_.isDate(d) && _.isFinite(d.getTime())));


// 2018-11-18 accept: generate function -> date string.
const toDate = (d) => new Date(_.isFunction(d) ? d() : d);

_.each(
  {
    before: (v, d) => _.lt(v, toDate(d)),
    after:  (v, d) => _.gte(v, toDate(d)),
  },
  (validator, keyword) => date.addValidate(keyword, {
    validator,
    defaults: Date.now,
    message: `{value} should ${keyword} {params}`
  })
);

date.superMethod('range', function (af, bf) {
  return this.after(af).before(bf);
});

date.superMethod('toJSON', function () {
  let {type, $js_schema, ...json} = toJSON.call(this);
  return {...json, $js_schema: {...$js_schema, type}, type: 'string', format: 'date-time'};
});

date.addKeyword('accept', 'date-time');

// const isValid = date.class.prototype.isValid;
// date.superMethod('isValid',
//   function (value, callback) {
//     if (this.get('ISOString') && _.isString(value) && (formats.date(value) || formats['date-time'](value)))
//       value = new Date(value);
//     return isValid.call(this, value, callback);
//   }
// );

module.exports = {date};
