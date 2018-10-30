const chai = require('chai');
const faker = require('faker');
const should = chai.should();
const {string} = require('../src/string');

describe('STRING SCHEMA TEST', () => {

  let str = faker.name.findName();

  it('String types validate', (done) => {
    string.isValid(str, (err, val) => {
      should.not.exist(err);
      val.should.deep.equal(str);

      string.isValid(null, (err) => {
        err.should.be.instanceOf(TypeError);

        return done()
      });
    });
  });
});
