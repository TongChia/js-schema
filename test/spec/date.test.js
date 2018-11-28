const chai = require('chai');
const should = chai.should();
const {date} = require('../../src/date');
const {series} = require('async');

describe('DATE SCHEMA TEST', () => {

  const now = new Date;
  const day = '1984-04-04';

  it('Date types validate', (done) => {
    date.isValid(now, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(now);

      date.isValid(day, (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

  it('Range validate', (done) => {

    series([

      cb => date.before(day).isValid(now, (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

      // `now` should before realtime `now`;
      cb => date.before(Date.now).isValid(now, cb),

      // `after` & `before` could be date-time string;
      cb => date.after(day).isValid(now, cb)

    ], done);
  });

  // it('Accept date-time format string', (done) => {
  //
  //   series([
  //     cb => date.ISOString().isValid('foobar', (err) => {
  //       err.should.be.instanceOf(Error);
  //       return cb();
  //     }),
  //
  //     cb => date.ISOString().isValid(now, cb),
  //
  //     cb => date.ISOString().isValid(day, cb)
  //
  //   ], done);
  //
  // });

});
