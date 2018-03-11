import '@babel/polyfill';
import chai from 'chai';
import {Any} from '../src/types';
import Schema from '../src/Schema';

const should = chai.should();
const types = [String, Number, Boolean, Date, Object, Array, Function, Any];
if ('undefined' !== typeof Buffer)
  types.push(Buffer);

describe('SCHEMA TEST', () => {


  describe('CREATE SCHEMA', () => {


    it('Simple types', () => {
      for (let Type of types) {
        for (let _Type of [Type, Type.name, Type.name.toLowerCase()]) {
          Schema(_Type).type.should.equal(Type);
          Schema({type: _Type}).type.should.equal(Type);
          (new Schema(_Type)).type.should.equal(Type);
        }
      }

      Schema('*').type.should.equal(Any);
    });

    it('Keep properties', () => {
      let define = {
        type: 'string',
        enum: ['foo', 'bar'],
        foo: true,
        bar: false
      };
      let schema = new Schema(define);
      schema.should.hasOwnProperty('enum');
      schema.should.hasOwnProperty('foo');
      schema.should.hasOwnProperty('bar');
    });

    it('Object description', () => {
      let schema = new Schema(String);
      let keys = Object.keys(schema);
      // schema.validates();
      // keys.should.deep.equal(schema.keys());
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


  it('Create schema', () => {

    const schema = new Schema({
      name:    String,
      binary:  Buffer,
      living:  Boolean,
      updated: { type: Date, default: Date.now },
      // age:     { type: Number, min: 18, max: 65 },
      // // mixed:   Schema.Types.Mixed,
      // // _someId: Schema.Types.ObjectId,
      // array:      [],
      // ofString:   [String],
      // ofNumber:   [Number],
      // ofDates:    [Date],
      // ofBuffer:   [Buffer],
      // ofBoolean:  [Boolean],
      // // ofMixed:    [Schema.Types.Mixed],
      // // ofObjectId: [Schema.Types.ObjectId],
      // ofArrays:   [[]],
      // ofArrayOfNumbbers: [[Number]],
      // nested: {
      //   stuff: { type: String, lowercase: true, trim: true }
      // }
    });

    const result = schema.validateSync({
      name: 'TongChia',
      binary: new Buffer([0xff, 0x01, 0xf1]),
      living: true,
    });

    result.should.be.true;

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
