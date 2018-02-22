import '@babel/polyfill';
import chai from 'chai';
import {Any} from '../src/types';
import TypeDictionary from '../src/TypeDictionary';

const should = chai.should();


describe('TYPE DIC TEST', () => {

  let typeDic = new TypeDictionary;


  it('Add type', () => {
    let str = '', num = 0, bool = true, date = new Date(), arr = [];

    typeDic.add(String);
    typeDic.add(Number).add(Boolean);
    typeDic.add(Date, Array);
    (() => typeDic.add(Number)).should.throw(Error);

    (str).class.should.equal(String);
    (num).class.should.equal(Number);
    (arr).class.should.equal(Array);
    (bool).class.should.equal(Boolean);
    (date).class.should.equal(Date);

    String.toJSON().should.equal('string');
    Number.toJSON().should.equal('number');
    Boolean.toJSON().should.equal('boolean');
    Date.toJSON().should.equal('date');
    Array.toJSON().should.equal('array');

    JSON.stringify({type: String}).should.equal('{"type":"string"}');
  });


  it('Check has', () => {
    typeDic.has(String).should.be.true;
    typeDic.has('number').should.be.true;
    typeDic.has('Date').should.be.true;
    typeDic.has(Object).should.be.false;
  });


  it('Add error type should be throw', () => {
    (() => typeDic.add(0)).should.throw(TypeError);
    (() => typeDic.add(() => {})).should.throw(TypeError);
    (() => typeDic.add(async function () {})).should.throw(TypeError);
    (() => typeDic.add(function* () {})).should.throw(TypeError);
    (() => typeDic.add('')).should.throw(TypeError);
    (() => typeDic.add(null)).should.throw(TypeError);
    (() => typeDic.add(Any)).should.not.throw();
  });


  it('Add alias name', () => {
    (() => typeDic.alias(Object, '*')).should.throw(Error);
    (() => typeDic.alias(Any, '')).should.throw(TypeError);
    (() => typeDic.alias(Any, '*')).should.not.throw();
  });


  it('Get added types', () => {
    typeDic.get(String).should.equal(String);
    typeDic.get('String').should.equal(String);
    typeDic.get('string').should.equal(String);
    typeDic.get(Symbol.for('String')).should.equal(String);

    typeDic.get('*').should.equal(Any);
    typeDic.get('Any').should.equal(Any);
    typeDic.get('any').should.equal(Any);
    typeDic.get(Symbol.for('Any')).should.equal(Any);
  });


  it('Check type equal', () => {
    typeDic.equal('string', String).should.be.true;
    typeDic.equal(String, 'String').should.be.true;

    typeDic.equal(Any, '*').should.be.true;
    typeDic.equal(Any, Symbol.for('Any')).should.be.true;

    typeDic.equal(String, Any).should.be.false;
  });


  it('Delete added type', () => {
    typeDic.delete('String');
    should.not.exist(typeDic.get('String'));
    should.not.exist(typeDic.get(Symbol.for('String')));

    typeDic.delete('Boolean');
    should.not.exist(typeDic.get('Boolean'));
    should.not.exist(typeDic.get(Boolean));

    typeDic.delete('Any');
    should.not.exist(typeDic.get('*'));
    should.not.exist(typeDic.get('any'));
  });

});
