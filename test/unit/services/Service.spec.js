const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

chai.use(require('sinon-chai'));
const expect = chai.expect;

const { Service } = require('../../../src/services');

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

  describe('renderTemplate()', () => {
    // TODO
  });

  describe('sendNotification()', () => {
    it('is a function', () => {
      const service = new Service();
      expect(service.sendNotification).to.be.a('function');
    });
  });

  describe('name()', () => {
    it('returns an empty string', () => {
      const service = new Service();
      expect(service.name).to.eql('');
    });
  });
});
