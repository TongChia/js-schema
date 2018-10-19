import _ from 'lodash';

export const _setter = () => {};

export const TYPES = new Map(['string', _.isString]);

function addKeyword () {

}

export function Schema (keyword, func, parameter, _super) {

  const fn = function (val, cb) {
    if (!new.target) return fn.isValid(val, cb);
    fn.toObject(this);
  };

  fn.defines = Object.assign({}, _super, {[keyword]: parameter});

  fn.toObject = (o) => {};
  fn.toJSON = (format) => format ? () => {} : fn.defines;

  fn.isValid = (val, cb) =>
    _super.isValid(val, (err) => {
      if (err) {cb(err)}


    });

  return fn;
}

const createChecker = (keyword, checkFunc, parameter, _super) => {

};

const isNumber = createChecker('Number type', _.isNumber);
const isNumMax10 = _.partial(createChecker, 'max', _.partial(_.max, _, 10));


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

