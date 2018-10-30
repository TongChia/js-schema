js-schema
=========
JS Schema validation, compatible with `json-schema`, `Mongoose Schema`, ``

QUICK START
-----------

### Install
install with npm
```bash
npm i -S '@tongchia/jsschema'
```

### Usage
```js
const {string} = require('jsschema');

const schema = string.maxLength(200).minLength(5).match(/hello/);

schema.isValid('hello world', (err) => {
  assert.ifError(err);
});

schema.isValid('hello', (err) => {
  assert.ifError(err);
  console.log(err.message);
  //--> Invalid value for string.minLength(5)
});
```
```js
const schema = object.properties({
  name: string.maxLength(20).required(),
  age : number.max(150).min(0),
  birthday: date
});
schema.isValid({
  name: 'Tom',
  age: 12,
  birthday: now Date()
}, (err) => {
  assert.ifError(err);
});
```

VALIDATE
---

- Types
  - string
    - [x] enum
    - [x] pattern
    - [x] minLength
    - [x] maxLength
    - [x] format (chriso/validator.js)
  - number (integer)
    - [x] min
    - [x] max
    - [x] integer
    - [x] multipleOf
  - date
    - [x] after
    - [x] before
  - array
    - [x] minItems
    - [x] maxItems
    - [x] unique
    - [x] items
  - object
    - [x] properties
    - [x] required
    - [ ] additionalProperties
    - [ ] dependencies ✨
    - [ ] propertyNames
    - [ ] size
    - [ ] patternProperties
  - [x] null (nil)
  - [x] boolean
  - [x] buffer
- Metadata
  - [ ] title
  - [ ] description
  - [ ] default
  - [ ] examples
- SubSchemas
  - [ ] allOf
  - [ ] anyOf
  - [ ] oneOf
  - [ ] not
- [ ] Constant values
- [ ] Enumerated values

### CUSTOM
```javascript
const {string} = require('jsschema');

string.addValidate(
  'keyword', // the keyword
  {
    validator: (value, parameter) => check(value, parameter), // return true/false;
    message: 'Invalid value ( <%= value %> ) for <%= keyword %>(<%= params %>).',
  }
)

string.addValidate(
  'keyword',
  {
    isAsync: true,
    validator: (value, parameter, callback) => {
      // check value
      if ('ok')
        return callback(null, value)
      return callback(new ValidationError('...'))
    }
  }
)
```

#### TODO
- [x] custom validate;
- [x] async validator (with callback);
- [ ] async validator (es2015);
- [x] format validate;
- [ ] toModel
  - [ ] MobX;
  - [ ] MongoDB;
    - [ ] mQuery;
- [ ] mongoose schema;
- [ ] json-schema;
  - [ ] parse json-schema;
  - [ ] generate json-schema;
  - [ ] test with `ajv`;
- [ ] google protocol-buffers;
- [ ] GraphQL;
