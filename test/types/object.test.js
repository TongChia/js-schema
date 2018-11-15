const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const $ = require('async');
const {object} = require('../../src/object');
const {number} = require('../../src/number');
const {string} = require('../../src/string');

describe('OBJECT SCHEMA TEST', () => {

  const person = {
    name: faker.name.findName(),
    age: _.random(100),
    email: faker.internet.email()
  };

  const schema = object.properties({
    name: string,
    age: number.min(0).max(100, true)
  });

  it('Object types validate', (done) => {
    object.isValid(person, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(person);

      object.isValid('foobar', (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

  it('Required validate', (done) => {
    schema.isValid({}, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal({});

      schema.required(['age']).isValid({age: undefined}, (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

  it('Object properties validate', (done) => {
    schema.isValid(person, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(person);

      schema.isValid({age: 'foobar'}, (err) => {
        err.should.be.instanceOf(Error);

        return done();
      });
    });
  });

  it('Object size validate', (done) => {
    object.minProperties(1).isValid({}, (err) => {
      err.should.be.instanceOf(Error);

      object.maxProperties(1).isValid({
        foo: 'bar', bar: 'foo'
      }, (err) => {
        err.should.be.instanceOf(Error);

        object.size(1, 2).isValid({foo: 1}, (err) => {
          should.not.exist(err);

          object.size(1, 2).isValid({}, (err) => {
            err.should.be.instanceOf(Error);

            return done();
          });
        });
      });
    });
  });

  it('Dependencies validate', (done) => {
    const schema = object.properties({
      name: string,
      credit_card: number,
      billing_address: string,
    }).dependencies({
      credit_card: ['billing_address']
    });

    const data = {
      name: faker.name.findName(),
    };

    $.series([

      (cb) => schema.isValid(data, (err) => {
        should.not.exist(err);
        return cb();
      }),

      (cb) => schema.isValid(_.merge(data, {
        credit_card: 5555555555555555
      }), (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

      (cb) => schema.isValid(_.merge(data, {
        billing_address: faker.address.streetAddress()
      }), (err) => {
        should.not.exist(err);
        return cb();
      }),

      (cb) => schema.isValid(_.omit(data, 'credit_card'), (err) => {
        should.not.exist(err);
        return cb();
      })

    ], done);
  });

});
