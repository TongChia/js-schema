const Sugar = require('sugar-core');
const {hasBuffer} = require('./utils');
const {verifications, formatValidators} = require('./validates');
const {ensureSugarNamespace, addValidateKeyword, addFormatValidator} = require('./libs');

const {forEach} = Sugar.Object;
const {partial} = Sugar.Function;

const Schema = module.exports =
function parseJsonSchema (json) {
  //TODO: parse json-schema
};

Schema.getNamespace = ensureSugarNamespace;
Schema.addKeyword   = addValidateKeyword;
Schema.addFormat    = addFormatValidator;

['Object', 'Array', 'Number', 'String', 'Boolean', 'Date', 'RegExp', 'Function', 'Error']
  .concat(hasBuffer ? 'Buffer' : [])
  .forEach((type) => Schema.getNamespace(type).defineStatic('defineValidate', partial(Schema.addKeyword, type)));

forEach(formatValidators, (validator, format) => Schema.addFormat(format, validator));

forEach(verifications, (verification, type) =>
  forEach(verification, (validate, keyword) =>
    Sugar[type]['defineValidate'](keyword, validate)));
