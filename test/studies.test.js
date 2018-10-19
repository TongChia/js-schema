const chai = require('chai');
const _ = require('lodash');
const expect = chai.expect;

describe('SCHEMA FUNCTION', () => {

  it('callable class', () => {

    const Fn = function (name, age) {
      if (!new.target)
        return _.isString(name) && _.isNumber(age);

      this.name = name;
      this.age  = age;
    };

    expect(Fn('tong', 30)).is.ok;
    expect(new Fn('tong', 30)).deep.equal({name: 'tong', age: 30});

    class fn extends Fn {
      constructor(...rest) {
        super(...rest)
      }

      who() {
        return this.name;
      }
    }

    expect((new fn('MiRinDa', 50)).who()).to.equal('MiRinDa');
  })

});
