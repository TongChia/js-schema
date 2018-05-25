import '@babel/polyfill';
import chai from 'chai';
import {Any} from '../src/types';
import Sugar from 'sugar';
import '../src/Schema';

const should = chai.should();
const types = [String, Number, Boolean, Date, Object, Array, Function, Any];
if ('undefined' !== typeof Buffer)
  types.push(Buffer);

describe('SCHEMA TEST', () => {

  it('NUMBER', () => {
    const NumSchema = Sugar.Number.min(5).max(20);
    const IntegerSchema = NumSchema.integer();

    NumSchema.isValid('8').should.be.false;
    NumSchema.isValid(6).should.be.true;
    NumSchema.isValid(4.8).should.be.false;
    NumSchema.isValid(20.1).should.be.false;

    IntegerSchema.isValid(0.1).should.be.false;
    IntegerSchema.isValid(8).should.be.true;
  });

  it('STRING', () => {
    const StrSchema1 = Sugar.String.maxLength(10).minLength(5);
    const StrSchema2 = Sugar.String.match(/o/).enum(['foo', 'hello']);

    StrSchema1.isValid('hello').should.be.true;
    StrSchema1.isValid('hello word!').should.be.false;
    StrSchema2.isValid('foo').should.be.true;
    StrSchema2.isValid('ok').should.be.false;
    StrSchema2.isValid('bar').should.be.false;
  });

  it('ARRAY', () => {
    const ArrSchema = Sugar.Array.maxItems(4).minItems(2).items(Sugar.String);
    const ArrSchemaQueue = ArrSchema.items([
      Sugar.String,
      Sugar.Number,
      Sugar.Function,
    ]);

    ArrSchema.isValid(['foo', 'bar']).should.be.true;
    ArrSchema.isValid([1, 2]).should.be.false;
    ArrSchema.isValid(['hello']).should.be.false;
    ArrSchemaQueue.isValid(['foobar', Math.PI, console.log]);
  });

  it('OBJECT', () => {
    const ObjSchema = Sugar.Object.properties({
      name: Sugar.String,
      age : Sugar.Number.min(18).max(60),
      married: Sugar.Boolean
    });


    ObjSchema.isValid({name: 'Tom', age : 30, married: true,}).should.be.true;
    ObjSchema.isValid({name: 'Tom', age : 80, married: true,}).should.be.false;
  });

});
