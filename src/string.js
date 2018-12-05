const _ = require('lodash');
const {createSchema} = require('./schema');
const {formats} = require('./formats');
const {keywords} = require('./keywords');

const str = createSchema('string', _.isString);
const Str = str.class;

_.each(keywords.string, (v, k) => Str.addValidate(k, v));
_.each(keywords.common, (v, k) => Str.addValidate(k, v));

Str.proto('regexp',function (regex, flags, message) {
  if (flags && !(/^[nsxAgimuy]+$/).test(flags)) {message = flags; flags = ''}
  let {source = regex, flags : fl = flags} = regex;
  let schema = str.division({regexp: [source, fl]});
  if (message) _.set(schema._, ['errorMessage', 'regexp'], message);
  return schema;
});

Str.proto('format', function (format, ...rest) {
  if (!_.has(formats, format))
    throw RangeError(
      'Invalid format `' + format + '`, see ' +
      'https://github.com/TongChia/js-schema/issues?q=is%3Aissue+format+' + format
    );

  let message, keyword = 'format', schema = str.division();

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

module.exports = {str, string: str};
