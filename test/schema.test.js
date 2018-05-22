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
        for (let type of [Type, Type.name, Type.name.toLowerCase()]) {
          Schema(type).type.should.equal(Type);
          Schema({type}).type.should.equal(Type);
          (new Schema(type)).type.should.equal(Type);
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


  it('Create schema', async () => {

    const schema = new Schema({
      name:    String,
      binary:  Buffer,
      living:  Boolean,
      updated: { type: Date, default: Date.now, asyncChecker: 1 },
      age:     { type: Number, min: 18, max: 65 },
      // // mixed:   Schema.Types.Mixed,
      // // _someId: Schema.Types.ObjectId,
      array:      [],
      ofString:   [String],
      ofNumber:   [Number],
      ofDates:    [Date],
      ofBuffer:   [Buffer],
      ofBoolean:  [Boolean],
      // // ofMixed:    [Schema.Types.Mixed],
      // // ofObjectId: [Schema.Types.ObjectId],
      ofArrays:   [[]],
      ofArrayOfNumbers: [[Number]],
      nested: {type: Object, properties: {
        stuff: { type: String, lowercase: true, trim: true }
      }, asynctest: true},
    });

    const result = await schema.validate({
      name: 'TongChia',
      binary: new Buffer([0xff, 0x01, 0xf1]),
      living: true,
      updated: new Date(),
      age: 65,
      ofString: ['foo', 'bar'],
      ofNumber: [1, 2, 0],
      ofArrays: [[1, 'foo', false]],
      ofArrayOfNumbers: [[123, 456], [789]],
      nested: {
        stuff: 'foobar'
      }
    });

    result.nested.start.should.instanceOf(Date)

  });

  it('Async validate', (done) => {
    let schema = new Schema({
      name: String,
      age: Number
    });

    schema.validate({name: 1, age: 2}, (err, value) => {
      console.log(err);
      console.log(value);
      done();
    });
  });

});
