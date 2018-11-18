JS-SCHEMA
=========
[![Build Status](https://travis-ci.org/TongChia/js-schema.svg?branch=master)](https://travis-ci.org/TongChia/js-schema)  
JS Schema validation library, compatible with `json-schema`.  
But not fully complying with `json-schema`,
the goal is to do data protection between the front, back end and database or micro services;
make it reusable as possible;
pursues concise and stylish code style.


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
    age     : number.min(0).max(130, true), // > 0 && <= 130
    birthday: date.after('1890-01-01'),
    married : boolean.default(false),
    books   : array.items(object.properties({
      title : string,
      author: string,
      publication_date: string.format('date')
    })),
    loggedIn: object.properties({
      ip   : string.format('ip'), // include ipv4 & ipv6
      oauth: string.enum(['facebook', 'github']),
      date : date.default(Date.now)
    })
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
    - [x] format
      - [x] \* from `chriso/validator.js` ✨
      - [x] data-time (full-date, full-time)
      - [x] ipv4, ipv6
      - [x] email
      - [x] hostname
      - [ ] uri, iri 
      - [ ] uri-template
      - [ ] json
      - [ ] regex
    - [ ] String-Encoding Non-JSON Data
  - number (integer)
    - [x] minimum, maximum
    - [x] exclusiveMinimum, exclusiveMaximum
    - [x] min, max (alias to `minimum, maximum, exclusiveMinimum, exclusiveMaximum`)
    - [x] range (alias to `min, max`)
    - [x] integer
    - [x] multipleOf
    - [ ] converter (`numeric`)
  - date
    - [x] after
    - [x] before
    - [ ] converter (`date-time`, `full-date`, `date-string`, `time-stamp`)
  - array
    - [x] minItems
    - [x] maxItems
    - [x] unique
    - [x] items
    - [x] contains
    - [ ] entries ✨
    - [ ] Overload function ✨
  - object
    - [x] properties
    - [x] required
    - [ ] additionalProperties
    - [x] dependencies
      - [ ] schema dependencies
    - [ ] propertyNames
    - [x] size
    - [ ] patternProperties
  - [x] null (nil)
  - [x] boolean
  - buffer
    - [ ] converter (`strings`, `base64`)
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
- json-schema
  - [x] to json-schema
  - [ ] from json schema
- referenced schema
  - [ ] $id ⚡️
  - [ ] $ref ⚡️
  - [ ] resolve method (browser & nodeJs) ⚡️
  - [ ] cache

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
- [ ] function list;
  - [ ] test report;
  - [ ] automatic update;
- [x] async validator (with callback);
- [x] async validator (es2015);
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
