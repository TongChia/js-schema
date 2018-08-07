const Sugar = require('sugar');
const {verifications, formatValidators} = require('./validates');
const libs = require('./libs');
const _ = require('./utils');

const {forEach} = Sugar.Object;
const {append} = Sugar.Array;

const Schema = module.exports =
function parseJsonSchema (json) {
  //TODO: parse json-schema
};

forEach(libs, (v, k) => Schema[k] = v);

forEach(formatValidators, (validator, format) => Schema.addFormatValidator(format, validator));

forEach(verifications, (verification, type) => {
  let {alias, isValid, ...validates} = verification;
  let ns = Schema.createNamespace(type, isValid || _['is' + type]);
  forEach(append([type.toLowerCase(), type.toUpperCase()], alias), alia => Object.defineProperty(Schema, alia, {get: () => ns}));
  forEach(validates, (validate, keyword) => ns.defineValidate(keyword, validate))
});

Schema.date.toJSON = () => ({type: 'date-time'});
