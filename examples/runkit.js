var {obj, str, num, int, date, arr, bool, buff, any} = require('@tongchia/jsschema');
var assert = require('assert');

var person = obj.properties({
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
  binary  : Buffer.from('hello'),
  living  : false,
  age     : 30,
  email   : 'tongchia@live.com',
  birthday: new Date('10/18/1987'),

  ofNumber: [1, 2, 3],
  ofDates : [new Date()],
  ofArrays: [['key1', 'value1'], ['key2', 'value2']],

  books   : [{
    title : 'Programming Pearls',
    author: ['jon bentley']
  }]
}, (err) => {
  assert.ifError(err);
});

var json = JSON.stringify(person);
