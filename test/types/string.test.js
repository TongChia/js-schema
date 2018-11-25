const chai = require('chai');
const promised = require('chai-as-promised');
const faker = require('faker');
const should = chai.should();
const _ = require('lodash');
const $ = require('async');
const {string} = require('../../src/string');
const {err} = require('../../src/error');

chai.use(promised);

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

  it('String pattern (and regexp)', (done) => {

    $.parallel([

      (cb) => string.pattern('^foo$').isValid('foo', cb),

      (cb) => string.pattern('foo', err`foo is foobar's foo`).isValid('Foo', (err) => {
        err.should.instanceOf(Error);
        err.message.should.eq('foo is foobar\'s foo');
        return cb();
      }),

      // flags
      (cb) => string.regexp('^foo$', 'i').isValid('Foo', cb),

      // RegExp instance
      (cb) => string.regexp(/^foo$/i).isValid('Foo', cb),

      // XRegExp
      // `source` & `flags`
      (cb) => string.regexp({source: '^\\pS$', flags: 'A'}).isValid('💩', cb),

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

      await string.format('email').isValid('foobar').should.be.rejectedWith(Error);
    });

    it('IP', async () => {
      const ip4 = faker.internet.ip();
      const ip6 = faker.internet.ipv6();
      const ipv4Schema = string.format('ipv4', err`\`{value}\` should be an ipv4 address.`);

      await ipv4Schema.isValid(ip4).should.become(ip4);
      await string.format('ipv6').isValid(ip6).should.become(ip6);

      // format `ip` cloud validate ipv4 & ipv6 address
      await string.format('ip').isValid(ip4).should.become(ip4);
      await string.format('ip').isValid(ip6).should.become(ip6);

      await ipv4Schema.isValid(ip6).should.be.rejectedWith('`' + ip6 + '` should be an ipv4 address.');
      await string.format('ip', '6').isValid(ip6).should.become(ip6);
      await string.format('ip', '4').isValid(ip4).should.become(ip4);
      await string.format('ip', '4').isValid(ip6).should.be.rejectedWith(Error);

      // multiple parameters with error message.
      await string.format('ip', '4', err`ip format should be ipv4.`)
        .isValid(ip6).should.be.rejectedWith('ip format should be ipv4.');
    });

  });

});
