var assert = require('assert');
var {obj, str, num, int, date, arr, bool, buff, mixed} = require('@tongchia/jsschema');

// define schema;
var person = obj.properties({
  name      : str.maxLength(200).minLength(5),
  binary    : buff,
  living    : bool.default(true),
  updated   : date.default(Date.now),
  age       : int.min(0).max(65, true), // > 0 && <= 130
  email     : str.format('email'),
  birthday  : date.after('1890-01-01'),
  ofNumber  : arr.items(num),
  mixed     : mixed
}).required(['name', 'age', 'birthday']);

// check data;
person.isValid({
  name    : 'TongChia',
  binary  : Buffer.from('hello'),
  living  : false,
  age     : 30,
  email   : 'tongchia@live.com',
  birthday: new Date('10/18/1987')
}, (err) => {
  assert.ifError(err);
});

// share schema;
var json = JSON.stringify(person, '\t', 2);
