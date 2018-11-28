const chai = require('chai');
const should = chai.should();
const {buffer} = require('../../src/buffer');
const {series} = require('async');

describe('BUFFER SCHEMA TEST', () => {

  const b1 = Buffer.from([0xff, 0x0a, 0x01]);
  const b2 = Buffer.from('hello world');

  it('Buffer size', (done) => {

    series([

      cb => buffer.minBytes(5).isValid(b2, cb),
      cb => buffer.minBytes(5).isValid(b1, (err) => {
        err.should.instanceOf(Error);
        return cb();
      }),

      cb => buffer.maxBytes(3).isValid(b1, cb),
      cb => buffer.maxBytes(3).isValid(b2, (err) => {
        err.should.instanceOf(Error);
        return cb();
      }),

    ], done);
  });

});
