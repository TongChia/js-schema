const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const {object} = require('../src/object');
const {number, integer} = require('../src/number');

describe('OBJECT SCHEMA TEST', () => {

  const person = {
    name: faker.name.findName(),
    age: _.random(100),
    email: faker.internet.email()
  };

  const schema = object.properties({
    age: number.min(0).max(100, true)
  });

  it('Object types validate', (done) => {
    object.isValid(person, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(person);

      object.isValid('foobar', (err) => {
        err.should.be.instanceOf(TypeError);

        return done()
      });
    });
  });

  it('Required validate', (done) => {
    schema.isValid({}, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal({});

      schema.required(['age']).isValid({age: undefined}, (err) => {
        err.should.be.instanceOf(Error);

        return done()
      });
    });
  });

  it('Object properties validate', (done) => {
    schema.isValid(person, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(person);

      schema.isValid({age: 'foobar'}, (err) => {
        err.should.be.instanceOf(TypeError);

        return done()
      });
    });
  });

});
