const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

chai.use(require('sinon-chai'));
const expect = chai.expect;

const Service = require('../../src/services/Service');

describe('Service', () => {
  describe('constructor()', () => {
    it('sets options', () => {
      const options = {
        test: 'option',
      };

      const service = new Service(options);
      expect(service.options).to.eql(options);
    });
  });
});
