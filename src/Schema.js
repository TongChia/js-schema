import {
  assign, keys, simpleType, template, mapValues,
  isArray, isString, toPromise
} from './utils';
import {simpleTypeDic as types} from './TypeDictionary';
import {validates} from "./ValidateMap";
import {Any} from "./types";

const schemas = new Map();

const normalizes = {
  Object: (define) => types.has(define.type) ?
    {...define} :
    {type: Object, properties: {...define}},
  Array : (items) =>
    (items.length === 0) ?
      {type: Array, items: {type: Any}} :
    (items.length === 1) ?
      {type: Array, items: items[0]} :
    (types.has(items)) ? //TODO: 且不重复
      {type: items} :
      {type: Array, items},
  $: (define) => (types.has(define) && {type: define}),
  get String() {return this.$},
  get Function() {return this.$}
};

const normalize = (define) => {
  let normalizer = normalizes[simpleType(define)];
  return normalizer && normalizer(define);
};

const initProps = (props) => mapValues(props, Schema);
const initItems = (items) => isArray(items) ? items.map(Schema) : Schema(items);

function Schema ($id, define, options) {
  // recursive
  if (!new.target) return new Schema($id, define, options);

  if (!isString($id) || types.has($id)) define = $id; options = define;

  let formatted = normalize(define);
  if (!formatted) throw new TypeError('Invalid argument');

  this.assign(formatted);

  if (options.freeze) Object.freeze(this);
  if ($id) schemas.set($id, this);
}

Schema.prototype.set = function (prop, value) {
  if (prop === 'type')
    this.type = types.get(value);
  else if (prop === 'items')
    this.items = initItems(value);
  else if (prop === 'properties')
    this.properties = initProps(value);
  else
    this[prop] = value;
};

Schema.prototype.assign = function (define) {
  //TODO: Schema.schema, check define. (like json-schema)
  // if (!(define instanceof Schema) || defineSchema.validate(define))
  //   throw new Error('not validated');
  keys(define).forEach((prop) => {this.set(prop, define[prop])})
};

Schema.prototype.validateSync = function validateSync (value, force) {
  let _validates = this.validates;
  for (const valid in _validates) {
    if (Object.prototype.hasOwnProperty.call(_validates, valid)) {
      let {async, validator} = _validates[valid];
      if ((!force && !async) && !validator(value, this[valid]))
        return false;
    }
  }
  return true;
};

Schema.prototype.validate = function validate (value, callback) {
  if (!callback) return this.validateSync(value);
  let _validates = this.validates, errors = [];

  // TODO: should return one Error include errors. (mongoose)
  Promise.all(keys(_validates).forEach(valid => async () => {
    let {async, validator, message, error = Error} = _validates[valid];
    let _validator = async ? toPromise(validator) : validator;
    let result = await _validator(value, this[valid]);
    if (!result)
      return new error(template(message, {value, valid}))
  })).then(result => callback(undefined, result)).catch(callback)
};

Schema.prototype.toJSON = function (version = 'v4') {
  let type = this.type;
  return assign({}, this, {type: types.name(type)})
};

Schema.prototype.inspect = function inspect () {
  return `Schema {type: ${types.name(this.type)}}`
};

Object.defineProperty(Schema.prototype, 'validates', {
  enumerable: true,
  get: function getValidates () {
    return mapValues(this, (v, k) => validates.get(k))
  }
});

Schema.Types = types;
Schema.validates = validates;
Schema.schemas = schemas;

export default Schema;
