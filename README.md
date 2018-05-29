js-schema (with Sugar.js)
=========================
JS Schema validation, compatible with `json-schema`

QUICK START
-----------
```js
const Sugar = require('sugar');
const schema = Sugar.String.maxLength(200).minLength(5).match(/hello/);
// -> Schema {isValid: function (value) { /* check value */ }, ...}
schema.isValid('hello world');
// -> true
schema.isValid('hello');
// -> false
schema.isValid('foo', (err, data) => {
  assert.ifError(err);
  assert.equal('foo', data);
})
```
```js
const schema = Sugar.Object.properties({
  name: Sugar.String.maxLength(20).required(),
  age : Sugar.Number.max(150).min(0),
  birthday: Sugar.Date
});
schema.isValid({
  name: 'Tom',
  age: 12,
  birthday: now Date()
});
// => true
```
toJsonSchema
```js
Sugar.Number.max(10).min(1).toJSON();
// {
//   type: 'number',
//   max: 10,
//   min: 1
// }
Sugar.String.toJSON();
// {
//   type: 'string'
// }
```


VALIDATE
---

### BUILT-IN
- String
  - enum
  - match
  - minLength
  - maxLength
- Number
  - min
  - max
  - integer
- Date
  - after
  - before
- Array
  - minItems
  - maxItems
  - unique
  - items
- Object
  - properties
  - required

### CUSTOM
#### Sync validate
```javascript
SugarNamespace.validates.set(
  'keyword', // the keyword
  {
    validator: (value, parameter) => check(value, parameter), // return true/false;
    message: '${keyword} error, ${value} too big',
    error: RangeError // defalut ValidationError;
  }
)
```

#### Async validate
```javascript
SugarNamespace.validates.set(
  'keyword',
  {
    validator: (value, parameter, callback) => {
      if (value)
        return callback(null, value);
      else
        return callback(new Error('...'))
    }
  }
)
```

#### TODO
- [x] custom validate;
- [x] async validator (with callback);
- [ ] async validator (es2015);
- [ ] format validate;
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
