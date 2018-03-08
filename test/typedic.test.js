import '@babel/polyfill';
import chai from 'chai';
import {Any} from '../src/types';
import TypeDictionary from '../src/TypeDictionary';

const should = chai.should();


describe('TYPE DIC TEST', () => {

  let typeDic = new TypeDictionary;


  it('Add type', () => {
    (() => typeDic.add(String)).should.not.throw();
    (() => typeDic.add(Number)).should.not.throw();
    (() => typeDic.add(Boolean)).should.not.throw();
    (() => typeDic.add(Date).add(Array)).should.not.throw();
    (() => typeDic.add(Any, '*')).should.not.throw();
    (() => typeDic.add('number')).should.throw(TypeError);
    (() => typeDic.add(Number, Array)).should.throw(TypeError);
    (() => typeDic.add(0)).should.throw(TypeError);
    (() => typeDic.add(() => {})).should.throw(TypeError);
    (() => typeDic.add(async function () {})).should.throw(TypeError);
    (() => typeDic.add(function* () {})).should.throw(TypeError);
    (() => typeDic.add('')).should.throw(TypeError);
    (() => typeDic.add(null)).should.throw(TypeError);
  });


  it('Check has', () => {
    typeDic.has(String).should.be.true;
    typeDic.has('number').should.be.true;
    typeDic.has('Date').should.be.true;
    typeDic.has(Object).should.be.false;
    typeDic.has(Object).should.be.false;
  });

  it('Get added types', () => {
    typeDic.get(String).should.equal(String);
    typeDic.get('String').should.equal(String);
    typeDic.get('string').should.equal(String);
    // typeDic.get(Symbol.for('String')).should.equal(String);

    typeDic.get('*').should.equal(Any);
    typeDic.get('Any').should.equal(Any);
    typeDic.get('any').should.equal(Any);
    // typeDic.get(Symbol.for('Any')).should.equal(Any);
  });


  // it('Check type equal', () => {
  //   typeDic.equal('string', String).should.be.true;
  //   typeDic.equal(String, 'String').should.be.true;
  //
  //   typeDic.equal(Any, '*').should.be.true;
  //   typeDic.equal(Any, Symbol.for('Any')).should.be.true;
  //
  //   typeDic.equal(String, Any).should.be.false;
  // });


  it('Delete added type', () => {
    typeDic.delete(String);
    should.not.exist(typeDic.get('String'));
    should.not.exist(typeDic.get('string'));

    typeDic.delete('Boolean');
    should.not.exist(typeDic.get('Boolean'));
    should.not.exist(typeDic.get(Boolean));

    typeDic.delete('Any');
    should.not.exist(typeDic.get('*'));
    should.not.exist(typeDic.get('any'));
  });

});
