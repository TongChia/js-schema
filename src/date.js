const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const datetime = createSchema('date', (d) => (_.isDate(d) && _.isFinite(d.getTime())));
const Dt = datetime.class;

_.each(keywords.date,
  (validator, keyword) => Dt.addValidate(keyword, {
    validator, defaults: Date.now,
    message: `{value} should ${keyword} {params}`
  })
);
_.each(keywords.common, (v, k) => Dt.addValidate(k, v));

Dt.proto('range', function (start, end) {
  return this.after(start).before(end);
});

Dt.hook('toJSON', function (toJSON) {
  return _.assign(toJSON(), {type: 'string', format: 'date-time'});
});

Dt.addKeyword('accept', 'all');
Dt.hook('accept', (accept, params) => accept(_.isArray(params) ? params : [params]));

module.exports = {date: datetime, datetime};
