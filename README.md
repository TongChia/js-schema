js-schema (with Sugar.js)
=========================
JS Schema validation, compatible with `json-schema`

Quick start
-----------
```js
const S = require('sugar');
const schema = S.String.maxLength(200).minLength(5).match(/hello/);
// => Schema {isValid: function (value) { /* check value */ }, ...}
```
```js
const schema = S.Object.properties({
  name: S.String.maxLength(20).required(),
  age : S.Number.max(150).min(0),
  birthday: S.Date
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
S.Number.max(10).min(1).toJSON();
// {
//   type: 'number',
//   max: 10,
//   min: 1
// }
S.String.toJSON();
// {
//   type: 'string'
// }
```


API
---

### BUILT-IN

### CUSTOM
#### Sync validate
```javascript
Schema.validates.set(
  'keyword', // the keyword
  {
    validator: (value) => check(value), // return true/false;
    message: '${keyword} error, ${value} too big',
    error: RangeError // defalut ValidationError;
  }
)
```

#### Async validate
```javascript

Schema.validates.set(
  'keyword',
  {
    async: true,
    validator: (value, callback) => {
      if (value)
        return callback(null, value);
      else
        return callback(new Error('...'))
    }
  }
)

Schema.validates.set(
  'keyword',
  {
    validator: async (value) => { // return value, throw error;
      if(await checkWithAsync(value))
        return value;
      throw new ValidationError('...');
    }
  }
)

Schema.validates.set(
  'keyword',
  {
    validator: (value) => new Promise((s, r) => {})
  }
)
```
