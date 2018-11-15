const chai = require('chai');
const should = chai.should();
const {date} = require('../src/date');

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

    date.after(day).isValid(now, (err) => {
      should.not.exist(err);

      date.before(day).isValid(now, (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

  it('Accept RfC string', (done) => {

    date.RfCString().isValid('foobar', (err) => {
      err.should.be.instanceOf(Error);

      date.RfCString().isValid(now, (err) => {
        should.not.exist(err);

        date.RfCString().isValid(day, done);
      });
    });

  });

});
