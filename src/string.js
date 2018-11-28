const _ = require('lodash');
const {createSchema} = require('./schema');
const {formats} = require('./formats');

const string = createSchema('string', _.isString);

_.each(
  {
    enum     : _.flip(_.includes),
    minLength: (v, l) => v.length >= l,
    maxLength: (v, l) => v.length <= l,
    pattern  : (v, r) => RegExp(r).test(v),
    regexp   : (v, [source, flags]) => RegExp(source, flags).test(v),
    format   : (v, format) => formats[format](v),
    _format  : (v, [format, ...rest]) => formats[format.toString()](v, ...rest)
  },
  (validate, keyword) => string.addValidate(keyword, validate)
);

string.proto('regexp',function (regex, flags, message) {
  if (flags && !(/^[nsxAgimuy]+$/).test(flags)) {message = flags; flags = ''}
  let {source = regex, flags : fl = flags} = regex;
  let schema = new string.class({...this._, regexp: [source, fl]});
  if (message) _.set(schema._, ['errorMessage', 'regexp'], message);
  return schema;
});

string.proto('format', function (format, ...rest) {
  if (!_.has(formats, format))
    throw RangeError(
      'Invalid format `' + format + '`, see ' +
      'https://github.com/TongChia/js-schema/issues?q=is%3Aissue+format+' + format
    );

  let message, keyword = 'format', schema = new string.class({...this._});

  // Avoid conflict with json-schema's `format`, in the case of multiple parameters
  if (rest.length && _.last(rest).isTemplate) message = rest.pop();
  if (rest.length) {
    keyword = '_format';
    schema.set(keyword, [format, ...rest]);
  } else {
    schema.set(keyword, format);
  }

  if (message) schema.set(['errorMessage', keyword], message);

  return schema;
});

module.exports = {string};
