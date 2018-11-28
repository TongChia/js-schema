const chai = require('chai');
const should = chai.should();
const _ = require('lodash');
const {series} = require('async');
const {number, integer} = require('../../src/number');

const checkErr = (cb, msg) => (err) => {
  should.exist(err);
  err.should.instanceOf(Error);
  if (msg) err.message.should.eq(msg);
  return cb();
};

describe('NUMERIC SCHEMA TEST', () => {

  let float = Math.random();
  let int = Date.now();

  it('Numeric types validate', (done) => {
    number.isValid(float, (err, val) => {
      should.not.exist(err);
      val.should.equal(float);

      number.isValid(int.toString(), (err, val) => {
        err.should.be.instanceOf(Error);
        val.should.equal(int.toString());

        return done();
      });
    });
  });

  it('Enumerated values', (done) => {
    number.enum([2018, 1984]).isValid(2000, (err) => {
      err.should.instanceOf(Error);

      number.enum(_.times(10, i => 1 + i)).isValid(8, done);
    });
  });

  it('Integer validate', (done) => {
    series([
      cb => integer.isValid(int, cb),
      cb => integer.isValid(float, checkErr(cb)),
      cb => integer.max(1).isValid(float, checkErr(cb)),
    ], done);
  });

  it('Multiple of validate', (done) => {
    series([
      (cb) => integer.multipleOf(3).isValid(5, checkErr(cb)),
      (cb) => integer.multipleOf(3).isValid(6, cb),
      (cb) => number.multipleOf(2.5).isValid(5, cb),
    ], done);
  });

  it('Range validate', (done) => {
    let maxNumSchema = number.max(int, true);
    let minNumSchema = number.min(int);
    let rangeSchema  = number.range(float, int, true);

    _.get(rangeSchema, '_.maximum').should.equal(int);
    _.get(rangeSchema, '_.minimum').should.equal(float);

    series([

      (cb) => minNumSchema.isValid(int - float, checkErr(cb)),

      (cb) => rangeSchema.isValid(int - float, cb),

      (cb) => maxNumSchema.isValid(int + float, checkErr(cb)),

      (cb) => maxNumSchema.isValid(int - float, (err, val) => {
        should.not.exist(err);
        val.should.equal(int - float);
        return cb();
      }),

      (cb) => maxNumSchema.isValid(int, cb),

      (cb) => number.max(int).isValid(int, checkErr(cb)),

    ], done);
  });
});
