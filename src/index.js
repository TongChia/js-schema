const _any      = require('./any');
const _none     = require('./none');
const _null     = require('./null');
const _date     = require('./date');
const _number   = require('./number');
const _string   = require('./string');
const _array    = require('./array');
const _object   = require('./object');
const _buffer   = require('./buffer');
const _boolean  = require('./boolean');
const _function = require('./function');
const _error    = require('./error');
const _parse    = require('./parse');

const Schema = {
  ..._any,
  ..._none,
  ..._null,
  ..._date,
  ..._number,
  ..._string,
  ..._array,
  ..._object,
  ..._buffer,
  ..._boolean,
  ..._function,
  ..._error,
  ..._parse,
};

module.exports = Schema;
