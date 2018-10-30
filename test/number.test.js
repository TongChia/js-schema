const chai = require('chai');
const should = chai.should();
const {series} = require('async');
const {number, integer} = require('../src/number');

describe('NUMERIC SCHEMA TEST', () => {

  let float = Math.random();
  let int = Date.now();

  it('Numeric types validate', (done) => {
    number.isValid(float, (err, val) => {
      should.not.exist(err);
      val.should.equal(float);

      number.isValid(int.toString(), (err, val) => {
        err.should.be.instanceOf(TypeError);
        val.should.equal(int.toString());

        return done();
      })
    });
  });

  it('Integer validate', (done) => {
    integer.isValid(float, (err) => {
      err.should.be.instanceOf(Error);

      integer.isValid(int, (err, val) => {
        should.not.exist(err);
        val.should.equal(val);

        return done();
      })
    })
  });

  it('Multiple of validate', (done) => {
    series([
      (cb) => integer.multipleOf(3).isValid(5, (err) => {
        err.should.be.instanceOf(Error);
        return cb()
      }),
      (cb) => integer.multipleOf(3).isValid(6, (err) => {
        should.not.exist(err);
        return cb()
      }),
      (cb) => number.multipleOf(2.5).isValid(5, (err) => {
        should.not.exist(err);
        return cb()
      }),
    ], done)
  });

  it('Range validate', (done) => {
    let maxNumSchema = number.max(int, true);
    let minNumSchema = number.min(int);
    let rangeSchema  = number.range(float, int, true);

    rangeSchema._.max.should.deep.equal([int, true]);
    rangeSchema._.min.should.deep.equal([float, true]);

    series([

      (cb) => minNumSchema.isValid(int - float, (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

      (cb) => rangeSchema.isValid(int - float, (err) => {
        should.not.exist(err);
        return cb();
      }),

      (cb) => maxNumSchema.isValid(int + float, (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

      (cb) => maxNumSchema.isValid(int - float, (err, val) => {
        should.not.exist(err);
        val.should.equal(int - float);
        return cb();
      }),

      (cb) => maxNumSchema.isValid(int, (err) => {
        should.not.exist(err);
        return cb();
      }),

      (cb) => number.max(int).isValid(int, (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

    ], done);
  })
});
