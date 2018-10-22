const _ = require('lodash');

function Schema (val, cb) {
  if (!new.target)
    return this.isValid(val);
  this._ = val;
}

const props = {};

props.isValid = function (val, cb) {};

props.addAlias = function (...alias) {};

props.toJSON = function (version) {return this._};

props.toModule = function (val) {};

Schema.addModuleMethod = function () {};

Schema.string = new Schema({type: 'string'});

Schema.addKeyword = function (keyword, checkFunc) {

  props[keyword] = function (param) {
    return new Schema(_.merge(this._, {[keyword]: param}))
  }

};

// const isNumber = createChecker('Number type', _.isNumber);
// const isNumMax10 = _.partial(createChecker, 'max', _.partial(_.max, _, 10));

//////////////////////////
// HOW TO USE
//////////////////////////
// const Schema = {};

const schema = Schema.num.min(0).max(10);
const result = schema(8);

const object = Schema.obj.properties({
  foo: Schema.str.maxLength(100).required,
  bar: Schema.num.max(100)
});

const check = object.isValid({
  foo: 'Foo',
  bar: 2
});

Object.assign(Schema.properties, props);

module.exports = Schema;
