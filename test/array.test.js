const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const {series} = require('async');
const {array, unique} = require('../src/array');
const {number} = require('../src/number');
const {string} = require('../src/string');
const {nil} = require('../src/null');

describe('ARRAY SCHEMA TEST', () => {
  
  let nums = _.times(10, i => 1 + i); // [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
  let strs = _.times(_.random(1, 10), () => faker.name.findName());
  let list = [2018, 'foo', 31, null, 'bar'];

  it('Array types validate', (done) => {
    array.isValid(strs, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(strs);

      let str = faker.name.findName();
      array.isValid(str, (err) => {
        err.should.be.instanceOf(TypeError);

        return done()
      });
    });
  });

  it('Unique validate', (done) => {
    unique.isValid(['foo', 'bar', 'foo'], (err) => {
      err.should.be.instanceOf(Error);

      array.unique(false).isValid(['foo', 'bar', 'foo'], (err) => {
        should.not.exist(err);

        return done();
      })
    })
  });

  it('Contains validate', (done) => {
    array.contains(nil).isValid(strs, (err) => {
      err.should.be.instanceOf(Error);

      array.contains(nil).isValid(list, (err) => {
        should.not.exist(err);

        return done();
      })
    });
  });

  it('Items validate', (done) => {
    let arrSchema = array.items(number.max(10, true));
    let queueSchema = array.items([number, string, number, nil]);

    series([
      (cb) => arrSchema.isValid(nums, (err) => {
        should.not.exist(err);
        return cb()
      }),

      (cb) => arrSchema.isValid(nums.concat(11), (err) => {
        err.should.be.instanceOf(Error);
        return cb()
      }),

      (cb) => queueSchema.isValid(list, (err) => {
        should.not.exist(err);
        return cb()
      }),

      (cb) => queueSchema.maxItems(4).isValid(list, (err) => {
        err.should.be.instanceOf(Error);
        return cb()
      }),

      (cb) => queueSchema.minItems(5).isValid(list, (err) => {
        should.not.exist(err);
        return cb()
      })
    ], done);

  })
});
