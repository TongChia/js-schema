const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const {date} = require('../src/date');

describe('DATE SCHEMA TEST', () => {

  const now = new Date;

  it('Date types validate', (done) => {
    date.isValid(now, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(now);

      date.isValid('foobar', (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

  it('Range validate', (done) => {

    const someDay = '1984-04-04';

    date.after(someDay).isValid(now, (err) => {
      should.not.exist(err);

      date.before(someDay).isValid(now, (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

});
