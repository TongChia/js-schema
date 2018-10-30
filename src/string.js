const _ = require('lodash');
const vjs = require('validator');
const createSchema = require('./schemaFactory');

const string = createSchema('string', _.isString);

const formats = {
  'date-time': vjs.isRFC3339,
  'hostname': (str) => /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/gm.test(str),
};

const kebab = _.flow([_.kebabCase, _.partial(_.replace, _, /-(\d)/g, '$1')]);

_.each(vjs, (v, k) => {
  if (_.startsWith(k, 'is') && v.call)
    formats[kebab(k.slice(2))] = v
});

_.each(
  {
    'enum':    (v, arr) => _.includes(arr, v),
    minLength: (v, l) => v.length >= l,
    maxLength: (v, l) => v.length <= l,
    pattern:   (v, r) => RegExp(r).test(v),
    format:    (v, format, ...rest) => {
      if (_.has(formats, format))
        return formats[format](v, ...rest);
      throw RangeError('format ' + format);
    }
  },
  (validate, keyword) => string.addValidate(keyword, validate)
);

module.exports = {
  string,
  email: string.format('email'),
  ipv4: string.format('ip', 4),
  ipv6: string.format('ip', 6),
  hostname: string.format('hostname')
};
