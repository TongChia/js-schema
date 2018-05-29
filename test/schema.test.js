const chai = require('chai');
const Sugar = require('sugar');
const {Any} = require('../src/types');
const Schema = require('../src/Schema');

const should = chai.should();
const types = [String, Number, Boolean, Date, Object, Array, Function, Any];
if ('undefined' !== typeof Buffer)
  types.push(Buffer);

describe('SCHEMA TEST', () => {

  it('NUMBER', (done) => {
    const NumSchema = Sugar.Number.min(5).max(20);
    const IntegerSchema = NumSchema.integer();

    NumSchema.isValid('8').should.be.false;
    NumSchema.isValid(6).should.be.true;
    NumSchema.isValid(4.8).should.be.false;
    NumSchema.isValid(20.1).should.be.false;

    IntegerSchema.isValid(0.1).should.be.false;
    IntegerSchema.isValid(8).should.be.true;

    NumSchema.isValid(1, (err, result) => {
      should.exist(err);
      result.should.equal(1);

      IntegerSchema.isValid(9, (err, result) => {
        should.not.exist(err);
        result.should.equal(9);

        done();
      })
    });
  });

  it('STRING', (done) => {
    const StrSchema1 = Sugar.String.maxLength(10).minLength(5);
    const StrSchema2 = Sugar.String.match(/o/).enum(['foo', 'hello']);

    StrSchema1.isValid('hello').should.be.true;
    StrSchema1.isValid('hello word!').should.be.false;
    StrSchema2.isValid('foo').should.be.true;
    StrSchema2.isValid('ok').should.be.false;
    StrSchema2.isValid('bar').should.be.false;

    StrSchema1.isValid(undefined, (err) => {
      err.message.should.equal('variable is not defined.');
      done();
    })
  });

  it('DATE', () => {
    const DateSchema = Sugar.Date.after('2018-01-03').before('2018-03-03');

    DateSchema.isValid(new Date('2018-02-26')).should.be.true;
  });

  it('ARRAY', (done) => {
    const ArrSchema = Sugar.Array.maxItems(4).minItems(2).unique().items(Sugar.String);
    const ArrSchemaQueue = Sugar.Array.items([
      Sugar.String,
      Sugar.Number,
      Sugar.Function,
    ]).unique();

    ArrSchema.isValid(['foo', 'bar']).should.be.true;
    ArrSchema.isValid(['foo', 'bar', 'foo']).should.be.false;
    ArrSchema.isValid([1, 2]).should.be.false;
    ArrSchema.isValid(['hello']).should.be.false;
    ArrSchemaQueue.isValid(['foobar', Math.PI, console.log]).should.be.true;
    ArrSchemaQueue.isValid(['foobar', Math.PI, false], (error, result) => {
      should.exist(error);
      error.should.instanceof(Error);
      error.errors['2'].should.instanceof(Error);
      done();
    });
  });

  it('OBJECT', (done) => {
    const ObjSchema = Sugar.Object.properties({
      name: Sugar.String,
      age : Sugar.Number.min(18).max(60),
      married: Sugar.Boolean
    }).required(['name']);

    ObjSchema.isValid({name: 'Tom', age : 30, married: true,}).should.be.true;
    ObjSchema.isValid({age: 20, married: false}).should.be.false;

    ObjSchema.isValid({name: 'Tom', age : 16, married: true,}, (error, result) => {
      should.exist(error);
      error.should.instanceof(Error);
      error.errors['age'].should.instanceof(Error);

      ObjSchema.isValid({age: 20, married: false}, (err) => {
        should.exist(err);
        err.errors['name'].type.should.equal('Undefined');
        done();
      });
    });

  });

});
