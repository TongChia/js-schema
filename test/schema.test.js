import chai from 'chai';
import Schema from '../src/schema';

const should = chai.should();

describe('SCHEMA TEST', () => {

  const schema = new Schema;

  it('SIMPLE', () => {

    schema.isValid('hello').should.be.true;
    schema.integer(true).isValid(1.1).should.be.false;

  });

  it('CALLBACK', (done) => {

    schema.integer(true).isValid(0.1, (err) => {
      should.exist(err);
      done();
    });

  });

});
