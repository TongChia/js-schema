const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const {series} = require('async');
const {any, none, string, integer, number, nil} = require('../../src');


describe('ANY SCHEMA TEST', () => {

  it('Not', (done) =>
    series([

      cb => any.not(string).isValid(Math.random(), cb),
      cb => any.not(string).isValid(null, cb),
      cb => any.not(string).isValid('foo bar', (err) => cb(!err)),
      cb => any.not(none).isValid(undefined, cb),

    ], done));

  it('OneOf', (done) =>
    series([

      cb => any.oneOf([string, integer, nil]).isValid('foo', cb),
      cb => any.oneOf([string, integer, nil]).isValid(1, cb),
      // none
      cb => any.oneOf([string, integer, nil]).isValid(true, (err) => cb(!err)),
      // twice
      cb => any.oneOf([string, integer, nil, any]).isValid('hello', (err) => cb(!err)),

    ], done));

  it('AllOf', (done) =>
    series([

      cb => any.allOf([any, integer, number]).isValid(11, cb),
      cb => any.allOf([any, integer, string]).isValid(11, (err) => cb(!err)),
      cb => any.allOf([any, string, number]).isValid(11, (err) => cb(!err)),
      cb => any.allOf([string, integer, number]).isValid(11, (err) => cb(!err)),

    ], done));

  it('AnyOf', (done) =>
    series([

      cb => any.anyOf([string, integer, number]).isValid(11, cb),
      cb => any.anyOf([nil, string, number]).isValid(11, cb),
      cb => any.anyOf([string, nil, integer]).isValid(0.1, (err) => cb(!err)),

    ], done));

});
