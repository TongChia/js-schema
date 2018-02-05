import '@babel/polyfill';
import chai from 'chai';
import {Any} from '../src/types';
import TypeDictionary from '../src/TypeDictionary';

const should = chai.should();


describe('TYPE DIC TEST', () => {

  let typeDic = new TypeDictionary;


  it('Add type; Type should be has prototype `class`.', () => {
    let str = '', num = 0, bool = true, date = new Date(), arr = [];

    typeDic.add(String);
    typeDic.add(Number);
    typeDic.add(Boolean);
    typeDic.add(Date);
    typeDic.add(Array);

    (str).class.should.equal(String);
    (num).class.should.equal(Number);
    (arr).class.should.equal(Array);
    (bool).class.should.equal(Boolean);
    (date).class.should.equal(Date);

    JSON.stringify({type: String}).should.equal('{"type":"string"}');
  });


  it('Add error type should be throw', () => {
    (() => typeDic.add(null)).should.throw(TypeError);
    (() => typeDic.add(0)).should.throw(TypeError);
    (() => typeDic.add(() => {})).should.throw(TypeError);
    (() => typeDic.add(async function () {})).should.throw(TypeError);
    (() => typeDic.add(function* () {})).should.throw(TypeError);
    (() => typeDic.add(Any, '')).should.throw(TypeError);
    (() => typeDic.add(Any, 1)).should.throw(TypeError);
    (() => typeDic.add(Any, null)).should.throw(TypeError);
    (() => typeDic.add(Any, '*')).should.not.throw();
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
