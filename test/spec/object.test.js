const chai = require('chai');
const should = chai.should();
const faker = require('faker');
const _ = require('lodash');
const $ = require('async');
const {object, properties, number, string, nil} = require('../../src');

describe('OBJECT SCHEMA TEST', () => {

  const person = {
    name: faker.name.findName(),
    age: _.random(100),
    email: faker.internet.email()
  };

  const schema = properties({
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

    $.series([

      cb => schema.isValid(person, cb),

      cb => schema.isValid({age: 'foobar'}, (err) => {
        err.should.be.instanceOf(Error);
        return cb();
      }),

      cb => object.properties({
        foo: string,
        bar: number,
        person: schema,
      }).isValid({foo: 'baz', bar: 1, person}, cb),


      cb => object.properties({
        person: schema,
      }).isValid({person: {name: 123}}, (err) => {
        err.should.be.instanceOf(Error);
        err.path.should.be.eq('person.name');
        return cb();
      })

    ], done);

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

  it('Pattern properties', (done) => {

    $.series([

      cb => object.patternProperties({
        '^\\$[^$]+': string,
        '^\\_[^_]+': number,
      }).isValid({$foo: 'bar', _baz: 1}, cb),

      cb => object.properties({
        _foo: string
      }).patternProperties({
        '^\\_[^_]+': number,
      }).isValid({_foo: 'bar'}, (err) => {
        err.should.instanceOf(Error);
        return cb();
      }),

    ], done);

  });

  it('Additional properties', (done) => {

    $.series([
      cb => object
        .properties({age: number})
        .additionalProperties(string)
        .isValid(person, cb),

      cb => object
        .properties({name: string})
        .additionalProperties(string)
        .isValid(person, (err) => {
          err.should.instanceOf(Error);
          err.path.should.eq('age');
          return cb();
        }),

      cb => object.properties({
        id: number,
      }).patternProperties({
        '^S_': string
      }).additionalProperties(nil).isValid({
        id: 1,
        S_01: 'foo bar',
        keyword: null
      }, cb)

    ], done);
  });

  it('Matched properties', (done) => {

    $.series([

      cb => object
        .properties({foo: string, bar: number})
        .matched(1)
        .isValid({foo: 'hello'}, cb),

      cb => object
        .properties({foo: string, bar: number})
        .matched(2)
        .isValid({foo: 'hello'}, (err) => {
          err.should.instanceOf(Error);
          return cb();
        }),

      cb => object
        .patternProperties({'^\\d+$': string})
        .matched(1)
        .isValid({'1': 'hello'}, cb),

      cb => object
        .patternProperties({'^\\d+$': string})
        .matched(2)
        .isValid({'1': 'hello', 'foo': 'bar'}, (err) => {
          err.should.instanceOf(Error);
          return cb();
        }),

      cb => object
        .properties({'foo': string})
        .patternProperties({'^\\d+$': string})
        .matched(2)
        .isValid({'1': 'hello', 'foo': 'bar'}, cb),

      cb => object
        .properties({'foo': string})
        .patternProperties({'^foo$': string})
        .matched(2)
        .isValid({'1': 'hello', 'foo': 'bar'}, (err) => {
          err.should.instanceOf(Error);
          return cb();
        })

    ], done);

  });

});
