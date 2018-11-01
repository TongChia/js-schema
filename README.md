js-schema
=========
JS Schema validation, compatible with `json-schema`, `Mongoose Schema`

QUICK START
-----------

### Install
install with npm
```bash
npm i -S '@tongchia/jsschema'
```

### Usage
```js
const {object, string, number, date, array, boolean} = require('jsschema');

const person = object
  .properties({
    name    : string.maxLength(200).minLength(5),
    age     : number.min(0, true).max(150),
    birthday: date,
    married : boolean,
    books   : array.items(string)
  })
  .required(['name', 'age', 'birthday']);

person.isValid({
  name    : 'TongChia',
  age     : 30,
  birthday: new Date('10/18/1987')
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
- [ ] to json schema
- [ ] from json schema

### Custom
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
- [ ] browser test;
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
