import _ from 'lodash';
import keywords from './keywords';

function Schema (definitions = {}) {
  if (!new.target) return new Schema(definitions);
  this._ = definitions;
}

Schema.chain = function (keyword) {
  this.prototype[keyword] = function (...params) {
    return this.division({[keyword]: params});
  };
};

const proto = Schema.prototype;

proto.division = function (properties) {
  return new Schema({...this._, ...properties});
};

proto.isValid = function (value, callback) {
  const isSync = !callback;

  return _(Schema.fn.keywords)
    .keys()
    .filter(validate => _.has(this._, validate))
    .reduce((errors, keyword) => {
      const [params, message] = this._[keyword], {validator, message: defaultMsg} = Schema.fn.keywords[keyword];

      if (!validator.call(this, value, params))
        errors.push(new Error(message || defaultMsg || '', {value})); //TODO: msg template

      return errors;

    }, []);
};

function fn (keyword, describe) {
  if (_.isPlainObject(keyword)) return _.values(keyword, this::fn);
  this.chain(keyword);
  fn.keywords[keyword] = describe;
}

fn.keywords = keywords;
_.each(_.keys(keywords), (key) => Schema.chain(key));

Schema.fn = fn;

Schema.plugin = (plugins) => {
  return _.merge(Schema.bind({}), {...plugins})
};

export default Schema;
