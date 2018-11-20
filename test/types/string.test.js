const chai = require('chai');
const faker = require('faker');
const should = chai.should();
const _ = require('lodash');
const $ = require('async');
const {string} = require('../../src/string');
const {err} = require('../../src/error');

describe('STRING SCHEMA TEST', () => {

  let str = faker.name.findName();

  it('String types validate', (done) => {
    string.isValid(str, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(str);

      string.isValid(null, (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

  it('Enumerated values', (done) => {
    string.enum(['foo', 'bar']).isValid('foobar', (err) => {
      err.should.instanceOf(Error);
      string.enum(['foo', 'bar']).isValid('foo', done);
    });
  });

  it('String pattern validate', (done) => {

    $.parallel([
      (cb) => string.pattern('foo').isValid('bar', (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

      (cb) => string.pattern(/foo/).isValid('foobar', cb),

      (cb) => string.pattern('^foo$').isValid('foo', cb),

      (cb) => string.pattern(['^foo$', 'i']).isValid('Foo', cb),

    ], done);

  });

  it('String length', (done) => {
    const schema = string.minLength(1).maxLength(5);

    schema.isValid('hello', (err) => {
      should.not.exist(err);

      schema.isValid('hello world', (err) => {
        err.should.instanceOf(Error);

        return done();
      });
    });
  });

  describe('STRING FORMAT', () => {

    it('full-date', (done) => {
      const $date = string.format('date');

      $date.isValid('foobar', (err) => {
        err.should.instanceOf(Error);

        $date.isValid('1987-10-18', done);
      });
    });

    it('full-time', (done) => {
      const $time = string.format('time');

      $time.isValid('foobar', (err) => {
        err.should.instanceOf(Error);

        $time.isValid('09:13:05.102Z', done);
      });
    });

    it('date-time', (done) => {
      const $dateTime = string.format('date-time');

      $dateTime.isValid(new Date().toString(), (err) => {
        err.should.instanceOf(Error);

        $dateTime.isValid(new Date().toISOString(), done);
      });
    });

    it('Email', async () => {
      const email = faker.internet.email();
      const result = await string.format('email').isValid(email);
      result.should.equal(email);

      try {
        await string.format('email').isValid('foobar');
      } catch (err) {
        err.should.instanceOf(Error);
      }
    });

    it('IP', async () => {
      const ip = faker.internet.ip(4);
      const ipv4Schema = string.format(['ip', 4], err`\`{value}\` should be an ipv4 address.`);
      const result = await ipv4Schema.isValid(ip);
      result.should.equal(ip);

      try {
        await ipv4Schema.isValid('foobar');
      } catch (err) {
        err.should.instanceOf(Error);
        err.message.should.equal('`foobar` should be an ipv4 address.');
      }
    });

  });

});
