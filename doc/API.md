json-fine API
===

Schema
---

### USAGE

`schema[keyword](params, message)`

```js
import JsonFine from 'json-fine';

const MyFine = JsonFine.plugin(/* plugins */);
const schema = MyFine({/* config */});
const strSchema = schema.type('string').maxLength(52);
strSchema.isValid('hello, world!');

const {string, number, datetime} = schema;

const accountSchema = schema({
  username: strSchema,
  password: string.minLength(10, 'password too short'),
  birthday: datetime.after('1984/04/01'),
  age: schema.anyOf(number, string.format('numeric'))
}).required(['username', 'password'])

const errors = accountSchema.isValid({
  username: 'tongchia',
  password: 'guess'
}, {
  returnErrors: true,
  deep: 3,
});
```

### ADD FUNCTION
```js
// for validate
Schema.fn('minLength', {
    targetType: 'string',
    validator: (value, param, config) => _.size(value) >= param,
})

// hooks
// before validate
Schema.fn('acceptDateFormat', {
    beforeValidate: (value, param, condif) => {/* ... */}
})

// metadata
Schema.fn('defaults')
// schema.defaults('foo bar')
```
#### options:
- validator
- asyncValidator
- targetType
- defaults

### USE PLUGIN
```js
import plugin1 from 'plugin1';
import plugin2 from 'plugin2';

const SchemaPlus = Schema.plugin(plugin1).plugin(plugin2);
const mySchema = SchemaPlus(/* config */);
```

### DEFINDE PLUGIN
```js
export default {
  handlers: {
    toModel: function () {/* ... */}
  },
  keywords: {
    const: _.eq,
    maxItems: {
      validator: (value, param) => _.size(value) < param
    }
  }
}
```
