const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const $ = require('async');
const {object, number, string, array, date, boolean, buffer, any} = require('../../src');

describe('MONGOOSE LIKE SCHEMA', () => {

  const schema = object.properties({

    name:       string,
    binary:     buffer,
    living:     boolean,
    updated:    date.default(Date.now),
    age:        number.min(18).max(65),
    mixed:      any,
    _someId:    string.format('mongo-id'),
    // decimal: number,
    array     : [],
    ofString  : [string],
    ofNumber  : [number],
    ofDates   : [date],
    ofBuffer  : [buffer],
    ofBoolean : [boolean],
    ofMixed   : [any],
    ofObjectId: [string.format('mongo-id')],

    ofArrays :  [[]],
    ofArrayOfNumbers : [[number]],

    ofObject:   [{

      title: string,
      address: [string],
      No: number

    }],

    nested: {
      stuff: string
    }

  });

  person = object.properties({
      name      : string.maxLength(200).minLength(5),
      binary    : buffer,
      living    : boolean.default(true),
      updated   : date.default(Date.now),
      age       : integer.min(0).max(65, true),
      email     : string.format('email'),
      birthday  : date.after('1890-01-01'),

      mixed     : any,
      _someId   : string.format('mongo-id'),
      _array    : array,
      array     : [],
      _ofString : array.items(string),
      ofString  : [string],
      ofNumber  : [number],
      ofDates   : [date],
      ofBuffer  : [buffer],
      ofBoolean : [boolean],
      ofMixed   : [any],
      ofObjectId: [string.format('mongo-id')],

      ofArrays  : [[]],
      ofArrayOfNumbers : [[number]],

      books     : [{
        title     : string,
        author    : [string],
      }],
    }).required(['name', 'age', 'birthday']);

  it('should valid', (done) => {

    schema.isValid({

      name     : 'tongChia',
      binary   : Buffer.from([]),
      living   : true,
      updated  : new Date(),
      age      : 30,
      mixed    : {foo: 'bar'},
      _someId  : '5349b4ddd2781d08c09890f3',

      array    : [1, 'x', null],
      ofString : ['foo', 'bar'],
      ofMixed  : [{foo: 'bar'}, new Date(), 123, '456'],
      ofObjectId: [],

      ofArrays : [[], [{}], [null, 1], ['foo', 'bar', 'baz']],
      ofArrayOfNumbers: [[1, 23], [8, 8, 9], [0]],

      ofObject : [{
        title   : 'hello js-schema',
        address : ['chongqing', 'china'],
        No      : 2088
      }],
      nested   : {
        stuff: 'foo bar'
      }

    }, done);

  });

});
