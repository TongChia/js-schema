const _ = require('lodash');
const vjs = require('validator');
const paramCase = require('param-case');

const date = '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])';
const time = '([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\\.[0-9]+)?([zZ]|[-+]([01][0-9]|2[0-3]):[0-5][0-9])';
const hostname = '([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*';

const formats = _.mapValues({
  hostname, date, time, 'date-time': '(' + date + ')[Tt ](' + time + ')'
}, (pattern) => (str) => RegExp('^' + pattern + '$').test(str));

_.each(vjs, (v, k) => {
  if (_.startsWith(k, 'is') && v.call)
    formats[paramCase(k.slice(2))] = v;
});

formats.ipv4 = _.partial(vjs.isIP, _, 4);
formats.ipv6 = _.partial(vjs.isIP, _, 6);

module.exports = {formats};
