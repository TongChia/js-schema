JS-SCHEMA
=========
[![Build Status](https://travis-ci.org/TongChia/js-schema.svg?branch=master)](https://travis-ci.org/TongChia/js-schema) 
[![npm](https://img.shields.io/npm/v/@tongchia/jsschema.svg)](https://www.npmjs.com/package/@tongchia/jsschema) 
[![NpmLicense](https://img.shields.io/npm/l/@tongchia/jsschema.svg)](https://www.npmjs.com/package/@tongchia/jsschema) 

JS Schema validation library, compatible with `json-schema`. 
But not fully complying with `json-schema`, 
It is more suitable for js use, just refer to the json-schema specification, 
pursues concise and stylish code style, 
make it reusable as possible.


QUICK START
-----------

### Install
install with npm
```bash
npm i -S '@tongchia/jsschema'
```

### Usage
```js
const {object, string, number, integer, date, array, boolean} = require('jsschema');

const person = object
  .properties({
    name    : string.maxLength(200).minLength(5),
    age     : integer.min(0).max(130, true), // > 0 && <= 130
    email   : string.format('email'),
    birthday: date.after('1890-01-01'),
    married : boolean.default(false),
    books   : [{ // => array.items(object.properties({
      title : string,
      author: string,
      publication_date: string.format('date')
    }],
    loggedIn: object.properties({
      ip    : string.format('ip'), // include ipv4 & ipv6
      oauth : string.enum(['facebook', 'github']),
      date  : date.default(Date.now)
    }),
    ofNumber: [number], // => array.items(number)
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

- string
  - [x] enum
  - [x] pattern
  - [x] minLength
  - [x] maxLength
  - [x] format
    - [x] \* from [chriso/validator.js](https://github.com/chriso/validator.js) ✨
      - `alpha`
      - `email`
      - `url`
      - `base64`
      - `hex-color`
      - `md5`
      - `mongo-id`
      - `uuid`
      - `ip` (`ipv4`, `ipv6`)
      - `json`
      - ...
    - [x] data-time (full-date, full-time)
    - [x] hostname
    - [ ] uri, iri 
    - [ ] uri-template
    - [x] regexp
  - [ ] String-Encoding Non-JSON Data
- number (integer)
  - [x] enum
  - [x] minimum, maximum
  - [x] exclusiveMinimum, exclusiveMaximum
  - [x] min, max (alias to `minimum, maximum, exclusiveMinimum, exclusiveMaximum`)
  - [x] range (alias to `min, max`)
  - [x] integer
  - [x] multipleOf
  - [ ] converter (`numeric`)
- date (`js-schema`)
  - [x] after
  - [x] before
  - [ ] converter (`date-time`, `full-date`, `date-string`, `time-stamp`)
- array
  - [x] minItems
  - [x] maxItems
  - [x] unique (`uniqueItems`)
  - [x] items
  - [x] additionalItems
  - [x] contains
  - [ ] entries ✨
  - [ ] Overload function ✨
- object
  - [x] properties
  - [x] required
  - [x] patternProperties
  - [x] additionalProperties
  - [x] size (`minProperties`, `maxProperties`)
  - [x] propertyNames
  - [x] dependencies
    - [ ] schema dependencies
- buffer (`js-schema`)
  - [ ] converter (`strings`, `base64`)
- null (nil)
- boolean
- function (`js-schema`)
- any
  - [x] allOf
  - [x] anyOf
  - [x] oneOf
  - [x] not
- [x] Constant values
- [x] Enumerated values
- Metadata
  - [x] title
  - [x] description
  - [x] default
  - [x] examples
- json-schema
  - [x] generate json-schema
  - [x] parse json-schema
    - [ ] Combining schemas ⚡️
- referenced schema
  - [ ] $id ⚡️
  - [ ] $ref ⚡️
  - [ ] resolve method (browser & nodeJs) ⚡️

### Custom
```javascript
const {string} = require('jsschema');

string.addValidate(
  'keyword', // the keyword
  {
    validator: (value, params) => check(value, parameter), // return true/false;
    message: '`{value}` should valid for schema:{type}.{keyword}({params})',
  }
)

string.addValidate(
  'keyword',
  {
    isAsync: true,
    validator: (value, params, callback) => {
      // check value
      if ('ok')
        return callback(null, value)
      return callback(new ValidationError('...'))
    }
  }
)
```

#### TODO
- [ ] custom validate;
- [ ] test report;
- [ ] automatic publish;
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
