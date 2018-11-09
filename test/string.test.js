const chai = require('chai');
const faker = require('faker');
const should = chai.should();
const {string} = require('../src/string');
const {err} = require('../src/error');

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

  describe('STRING FORMAT TEST', () => {

    it('Email', async () => {
      const email = faker.internet.email();
      (await string.format('email').isValid(email)).should.equal(email);

      try {
        await string.format('email').isValid('foobar');
      } catch (err) {
        err.should.instanceOf(Error);
      }
    });

    it('IP', async () => {
      const ip = faker.internet.ip(4);
      const ipv4Schema = string.format(['ip', 4], err`\`{value}\` should be an ipv4 address.`);
      (await ipv4Schema.isValid(ip)).should.equal(ip);

      try {
        await ipv4Schema.isValid('foobar');
      } catch (err) {
        err.should.instanceOf(Error);
        err.message.should.equal('`foobar` should be an ipv4 address.');
      }
    });

  });

});
