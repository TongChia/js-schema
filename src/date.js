const _ = require('lodash');
const {createSchema} = require('./schema');
const {keywords} = require('./keywords');

const date = createSchema('date', (d) => (_.isDate(d) && _.isFinite(d.getTime())));

_.each(keywords.date,
  (validator, keyword) => date.addValidate(keyword, {
    validator, defaults: Date.now,
    message: `{value} should ${keyword} {params}`
  })
);
_.each(keywords.common, (v, k) => date.addValidate(k, v));

date.proto('range', function (start, end) {
  return this.after(start).before(end);
});

date.hook('toJSON', function (toJSON) {
  return _.assign(toJSON(), {type: 'string', format: 'date-time'});
});

date.addKeyword('accept', 'all');
date.hook('accept', (accept, params) => accept(_.isArray(params) ? params : [params]));

module.exports = {date};
