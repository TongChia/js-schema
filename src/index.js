const _ = require('lodash');

module.exports = {
  ...require('./null'),
  ...require('./date'),
  ...require('./boolean'),
  ...require('./number'),
  ...require('./string'),
  ...require('./array'),
  ...require('./object'),
  ...require('./error'),
  ...(_.isUndefined(typeof Buffer) ? {} : require('./buffer')),
};
