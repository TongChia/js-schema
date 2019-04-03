import _ from 'lodash';
import keywords from './keywords';

const clusterID = _.random(0, 0xff);
let instanceID = 0, classID = 0;

function Schema (definitions = {}) {
  if (!new.target) return new Schema(definitions);
  this._ = definitions;
  this._id = _.join(_.map([clusterID, classID, instanceID++], id => id.toString(16)), '-');
}

const _static = {

  config: {},
  validates: {},
  prototype: {},

  fn (keyword, describe) {
    if (_.isFunction(describe)) return this.fn({validator: describe});
    if (!_.isEmpty(describe)) this.validates[keyword] = describe;
    this.prototype[keyword] = function (...params) {
      return this.division({[keyword]: params});
    };
    return this;
  },

  plugin ({keywords, handlers, defaultConfig}) {
    _.each(keywords, (describe, keyword) => this.fn(keyword, describe));
    classID++;
    return Schema;
  },
};

const proto = {

  class: Schema,

  division (properties) {
    return new Schema({...this._, ...properties});
  },

  isValid (value, config, callback) {
    if (_.isFunction(config)) return this.isValid(value, null, config);

    const valueType = Object.prototype.toString.call(value);

    const keys = _(this._).keys().filter(key => _.has(Schema.validates, key));

    return _(Schema.keywords)
      .keys()
      .filter(validate => _.has(this._, validate))
      .reduce((errors, keyword) => {
        const [params, message] = this._[keyword], {validator, message: defaultMsg} = Schema.fn.keywords[keyword];

        if (!validator.call(this, value, params))
          errors.push(new Error(message || defaultMsg || '', {value})); //TODO: msg template

        return errors;
      }, []);
  }
};

_.assign(Schema, {..._static});
_.assign(Schema.prototype, {...proto});

export default Schema.plugin({keywords});
