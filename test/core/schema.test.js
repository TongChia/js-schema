const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const $ = require('async');
const {object, number, string, array, date, boolean, buffer, any} = require('../../src');

describe('ARRAY SCHEMA TEST', () => {


  it('should valid', (done) => {

    object.properties({

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
      _ofArrays:  array.items(array.items(any)),

      ofArrayOfNumbers : [[number]],
      _ofArrayOfNumbers: array.items(array.items(number)),
      $ofArrayOfNumbers: array.items([number]),

      ofObject:   [{

        title: string,
        address: [string],
        No: number

      }],

      nested: {
        // stuff: { type: String, lowercase: true, trim: true }
        stuff: string
      },
      // map: Map,
      // mapOfString: {
      //   type: Map,
      //   of: String
      // }

    }).isValid({

      name: 'tongChia',
      binary: new Buffer([]),
      living: true,
      updated: new Date(),
      ofString: ['foo', 'bar'],
      ofObject: [],
      nested: {
        stuff: 'foo bar'
      }

    }, done);

  });

});
