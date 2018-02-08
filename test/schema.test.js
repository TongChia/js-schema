import '@babel/polyfill';
import chai from 'chai';
import {Any} from '../src/types';
import Schema from '../src/Schema';

const should = chai.should();


describe('SCHEMA TEST', () => {


  describe('CREATE SCHEMA', () => {


    it('Simple types', () => {
      let str  = new Schema(String);
      let num  = new Schema('number');
      let bool = new Schema({type: Boolean});
      let func = new Schema({type: 'function'});
      ({type: String}).should.deep.equal(str);
      num.type.should.equal(Number);
      bool.type.should.equal(Boolean);
      func.type.should.equal(Function);
    });

    it('`Nil` type', () => {
      let nul = new Schema({type: null});
      let nil = new Schema({type: 'nil'});
      should.equal(null, nul.type);
      should.equal(null, nil.type);
    });

    it('`Any` type', () => {
      let any = new Schema('*');
      any.type.should.equal(Any);
    });

    it('Keep properties', () => {
      let define = {
        type: 'string',
        enum: ['foo', 'bar'],
        foo: true,
        bar: false
      };
      let schema = new Schema(define);
      Object.assign(define, {type: String}).should.deep.equal(schema);
    });

    it('Object description', () => {

    });

    it('JSON (Compatible with "json-schema") description', () => {

    });

    it('to JSON (Converted into "json-schema")', () => {
      let str  = new Schema(String);
      let json = JSON.stringify(str);
      json.should.be.equal('{"type":"string"}')
    })

  });

  describe('VALIDATE', () => {

  });


  it.skip('Create schema', () => {

    const schema = new Schema({
      name:    String,
      binary:  Buffer,
      living:  Boolean,
      updated: { type: Date, default: Date.now },
      age:     { type: Number, min: 18, max: 65 },
      // mixed:   Schema.Types.Mixed,
      // _someId: Schema.Types.ObjectId,
      array:      [],
      ofString:   [String],
      ofNumber:   [Number],
      ofDates:    [Date],
      ofBuffer:   [Buffer],
      ofBoolean:  [Boolean],
      ofMixed:    [Schema.Types.Mixed],
      ofObjectId: [Schema.Types.ObjectId],
      ofArrays:   [[]],
      ofArrayOfNumbbers: [[Number]],
      nested: {
        stuff: { type: String, lowercase: true, trim: true }
      }
    });

    const result = schema.validateSync({
      name: 'TongChia',
      binary: new Buffer([0xff, 0x01, 0xf1])
    });

    result.should.be.TRUE;

  });

  it.skip('Create schema with a constructor(or class)', (done) => {
    const stringSchema = new Schema(String);
    const numberSchema = new Schema(Number);

    stringSchema.validateSync('foo bar', (result) => {
      result.should.be.equal(true);
      numberSchema.validateSync(1234);
      done();
    });
  });


});
