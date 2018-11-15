const chai = require('chai');
const should = chai.should();
const _ = require('lodash');
const {err} = require('../src/error');

describe('ERROR TEST', () => {

  it('Failed message', () => {
    let template = err`{value} should valid schema:{some}`;
    let message = template({value: 'foo', some: 'bar'});

    _.get(template, 'isTemplate').should.be.ok;
    message.should.equal('foo should valid schema:bar');
  });

});
