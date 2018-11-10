const _ = require('lodash');
const vjs = require('validator');
const createSchema = require('./schemaFactory');

const string = createSchema('string', _.isString);

const date = '(?<fullyear>\\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12][0-9]|3[01])';
const time = '(?<hour>[01][0-9]|2[0-3]):(?<minute>[0-5][0-9]):(?<second>[0-5][0-9]|60)(?<secfrac>\\.[0-9]+)?(?<offset>[zZ]|[-+]([01][0-9]|2[0-3]):[0-5][0-9])';

const formats = _.mapValues({
  'date'     : `^${date}$`,
  'time'     : `^${time}$`,
  'date-time': `^(?<date>${date})[Tt ](?<time>${time}$)`,
  'hostname' : '^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*$',
}, (match) => (str) => RegExp(match).test(str));

const kebab = _.flow([_.kebabCase, _.partial(_.replace, _, /-(\d)/g, '$1')]);

_.each(vjs, (v, k) => {
  if (_.startsWith(k, 'is') && v.call)
    formats[kebab(k.slice(2))] = v;
});

formats.ipv4 = _.partial(vjs.isIP, _, 4);
formats.ipv6 = _.partial(vjs.isIP, _, 6);

_.each(
  {
    'enum':    (v, arr) => _.includes(arr, v),
    minLength: (v, l) => v.length >= l,
    maxLength: (v, l) => v.length <= l,
    pattern:   (v, r) => RegExp(r).test(v),
    format:    (v, f) => {
      let [format, ...rest] = [].concat(f);
      if (_.has(formats, format))
        return formats[format](v, ...rest);
      throw RangeError(
        'Invalid format `' + format +'`, see ' +
        'https://github.com/TongChia/js-schema/issues?q=is%3Aissue+format'
      );
    }
  },
  (validate, keyword) => string.addValidate(keyword, validate)
);

module.exports = {string};
