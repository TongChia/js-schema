JS-SCHEMA
=========
[![Build Status](https://travis-ci.org/TongChia/js-schema.svg?branch=master)](https://travis-ci.org/TongChia/js-schema) 
[![npm](https://img.shields.io/npm/v/@tongchia/jsschema.svg)](https://www.npmjs.com/package/@tongchia/jsschema) 
[![NpmLicense](https://img.shields.io/npm/l/@tongchia/jsschema.svg)](https://www.npmjs.com/package/@tongchia/jsschema) 

JS Schema validation library, compatible with `json-schema`. 
It is more suitable for js use, pursues concise and stylish code style, make it reusable as possible.

welcome to `fork`,`pr`,`issues`;

[try it now!](https://npm.runkit.com/@tongchia/jsschema)

QUICK START
-----------

### Install
install with npm
```bash
npm i -S '@tongchia/jsschema'
```

### Usage
```js
const {obj, str, num, int, date, arr, bool, buff, any} = require('jsschema');

const person = obj.properties({
  name      : str.maxLength(200).minLength(5),
  binary    : buff,
  living    : bool.default(true),
  updated   : date.default(Date.now),
  age       : int.min(0).max(65, true), // > 0 && <= 130
  email     : str.format('email'),
  birthday  : date.after('1890-01-01'),
  
  mixed     : any,
  _someId   : str.format('mongo-id'),
  _array    : arr,
  array     : [],
  _ofString : arr.items(str),
  ofString  : [str], // same as `array.items(string)` ↑
  ofNumber  : [num],
  ofDates   : [date],
  ofBuffer  : [buff],
  ofBoolean : [bool],
  ofMixed   : [any],
  ofObjectId: [str.format('mongo-id')],
  
  ofArrays  : [[]],
  ofArrayOfNumbers : [[num]],
  
  books     : [{ // => array.items(object.properties({...
    title     : str,
    author    : [str],
  }],
}).required(['name', 'age', 'birthday']);

person.isValid({
  name    : 'TongChia',
  age     : 30,
  birthday: new Date('10/18/1987')
}, (err) => {
  assert.ifError(err);
});

// to json-schema;
console.log(JSON.stringify(person))
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

### Custom validate
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
