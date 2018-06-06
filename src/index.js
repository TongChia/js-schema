const Sugar = require('sugar-core');
const {hasBuffer} = require('./utils');
const verifications = require('./validates');
const {ensureSugarNamespace, addValidateKeyword} = require('./libs');

const {forEach} = Sugar.Object;
const {partial} = Sugar.Function;

const Schema =
function parseJsonSchema (json) {
  //TODO: parse json-schema
};

['Object', 'Array', 'Number', 'String', 'Boolean', 'Date', 'RegExp', 'Function', 'Error']
  .concat(hasBuffer ? 'Buffer' : [])
  .forEach((type) => ensureSugarNamespace(type).defineStatic('defineValidate', partial(addValidateKeyword, type)));

forEach(verifications, (verification, type) =>
  forEach(verification, (validate, keyword) =>
    Sugar[type].defineValidate(keyword, validate)));

module.exports = Schema;
