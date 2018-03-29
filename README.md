js-schema
=========
JS Schema validation, compatible with `json-schema`

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
