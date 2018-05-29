const chai = require('chai');
const Sugar = require('sugar');
const {ValidationError} = require('../src/types');
const should = chai.should();

describe('ERROR CLASS TEST', () => {

  it('NULL', () => {

    let err = new ValidationError();

    should.not.exist(ValidationError());
    should.not.exist(ValidationError(''));
    should.not.exist(ValidationError([]));
    should.not.exist(ValidationError({}));
    should.not.exist(ValidationError(null));
    err.should.instanceof(Error);
    err.name.should.equal('ValidationError');
    err.code.should.equal(400);
    Object.prototype.toString.call(err).should.equal('[object Error]');

  });

  it('MESSAGE', () => {

    ValidationError('${title} is not validation')
      .message.should.equal('variable is not validation');
    ValidationError('${title} is not validation', {title: 'age'})
      .message.should.equal('age is not validation');

  });

  it('ERROR', () => {

    let err = ValidationError(new TypeError('This is a type error'));
    err.message.should.equal('This is a type error');
    err.name.should.equal('TypeError');

  });

  it('ERRORS', () => {

    let err1 = ValidationError.multipleError([
      new Error('some error'),
      new ValidationError('validate error')
    ]);
    let err2 = ValidationError.multipleError({
      foo: new TypeError('type error'),
      bar: new ValidationError('validate error')
    });

    err1.should.instanceof(ValidationError);
    err1.errors[0].should.instanceof(Error);
    err1.errors[1].should.instanceof(ValidationError);

    err2.should.instanceof(ValidationError);
    err2.errors['foo'].should.instanceof(TypeError);
    err2.errors['bar'].should.instanceof(ValidationError);

  });

});
