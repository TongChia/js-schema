import '@babel/polyfill';
import chai from 'chai';
import {Any} from '../src/types';
import Schema from '../src/Schema';

chai.should();


describe('SCHEMA TEST', () => {


  describe('CREATE SCHEMA', () => {


    it('Simple types', () => {
      let str  = new Schema(String);
      let num  = new Schema(Number);
      let bool = new Schema(Boolean);
      let func = new Schema(Function);
      let date = new Schema(Date);
      str.type.should.equal(String);
      num.type.should.equal(Number);
      bool.type.should.equal(Boolean);
      func.type.should.equal(Function);
      date.type.should.equal(Date);
    });

    it('`Nil` type', () => {
      let nil = new Schema('Nil');
    });

    it('`Any` type', () => {
      let any = new Schema('*');
    });

    it('Object description', () => {

    });

    it('JSON (Compatible with "json-schema") description', () => {

    });

    it('to JSON (Converted into "json-schema")', () => {

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
