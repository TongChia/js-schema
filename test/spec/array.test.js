const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const {series} = require('async');
const {number, string, nil, array, unique} = require('../../src');

describe('ARRAY SCHEMA TEST', () => {
  
  let nums = _.times(10, i => 1 + i); // [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
  let strs = _.times(_.random(1, 10), () => faker.name.findName());
  let items = [2018, 'foo', 31, null, 'bar'];

  it('Array types validate', (done) => {
    array.isValid(strs, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(strs);

      let str = faker.name.findName();
      array.isValid(str, (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

  it('Unique validate', (done) => {
    unique.isValid(['foo', 'bar', 'foo'], (err) => {
      err.should.be.instanceOf(Error);

      array.unique(false).isValid(['foo', 'bar', 'foo'], (err) => {
        should.not.exist(err);

        return done();
      });
    });
  });

  it('Contains validate', (done) => {
    array.contains(nil).isValid(strs, (err) => {
      err.should.be.instanceOf(Error);

      array.contains(nil).isValid(items, (err) => {
        should.not.exist(err);

        return done();
      });
    });
  });

  it('Items validate', (done) => {
    let lists = array.items(number.max(10, true));
    let tuple = array.items([number, string, number, nil]);

    let shouldError = (cb) => (err) => {
      err.should.be.instanceOf(Error);
      return cb();
    };

    series([
      (cb) => lists.isValid([], cb),
      (cb) => lists.isValid(nums, cb),

      (cb) => lists.isValid(nums.concat(11), shouldError(cb)),

      (cb) => tuple.isValid([], cb),
      (cb) => tuple.isValid([1], cb),
      (cb) => tuple.isValid(_.take(items, 3), cb),
      (cb) => tuple.isValid(items, cb),

      (cb) => tuple.isValid(['foo'], shouldError(cb)),
      (cb) => tuple.isValid([1, 2], shouldError(cb)),
      (cb) => tuple.isValid([1, 'foo', 2, 'bar'], shouldError(cb)),

    ], done);

  });

  it('Items size', (done) => {
    let lists = array.items(number.max(10, true));
    let tuple = array.items([number, string, number, nil]);

    series([
      (cb) => lists.minItems(1).isValid([], (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

      (cb) => tuple.maxItems(4).isValid(items, (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

      (cb) => tuple.minItems(5).isValid(items, cb)

    ], done);

  });

  it('Additional items', (done) => {

    let lists = array.items(string).additionalItems(number);
    let tuple = array.items([number, string, number, nil]).additionalItems(number);

    series([
      cb => lists.isValid(['foo', 'bar'], cb),

      cb => tuple.isValid([1, 'bar', 2, null], cb),

      cb => tuple.isValid([1, 'bar', 2, null, 3], cb),

      cb => tuple.isValid([1, 'bar', 2, null, 'bad egg'], (err) => {
        err.should.be.instanceOf(Error);
        err.path.should.eq(4);
        return cb();
      }),

      // TODO: .additionalItems(date.accept('date-time'))

    ], done);

  });

});
