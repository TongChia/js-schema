const _ = require('lodash');
const {createSchema} = require('./schema');
const {formats} = require('./formats');

const string = createSchema('string', _.isString);

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
