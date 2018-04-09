const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

chai.use(require('sinon-chai'));
const expect = chai.expect;
const sandbox = sinon.createSandbox();

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
    let service;

    beforeEach(() => {
      service = new Service();
      sandbox.stub(service, 'getCIEnvironmentVariables').returns({
        ciPipelineId: 123456,
        ciProjectName: 'Test Project',
        ciCommitSha: '77777777777777777777777777777777',
        ciEnvironmentName: 'test',
      });
    });

    it('calls getCIEnvironmentVariables()', () => {
      service.renderTemplate();
      expect(service.getCIEnvironmentVariables).to.have.been.called;
    });

    it('renders the default template', () => {
      service.renderTemplate();
      expect(service.renderedTemplate).to.be.a('string');
      expect(service.renderedTemplate).to.eql('#123456: Test Project (7777777) deployed to test');
    });

    afterEach(() => {
      sandbox.restore();
    });
  });

  describe('getCIEnvironmentVariables()', () => {
    const testVariable = 'test CI environment variable';
    let service;

    before(() => {
      service = new Service();
      process.env.CI_TEST_VARIABLE = testVariable;
    });

    it('extracts and transforms environment variables starting with CI to camelcase', () => {
      const result = service.getCIEnvironmentVariables();
      expect(result).to.eql({
        ciTestVariable: testVariable
      });
    });

    after(() => {
      delete process.env.CI_TEST_VARIABLE;
    });
  });

  describe('printNotification()', () => {
    const testRenderedTemplate = { test: 'test' };
    let service;

    before(() => {
      service = new Service();
      service.renderedTemplate = testRenderedTemplate;
    });

    it('prints the rendered template', () => {
      sandbox.stub(console, 'info');
      service.printNotification();
      expect(console.info).to.have.been.calledWith(JSON.stringify(testRenderedTemplate));
    });

    after(() => {
      sandbox.restore();
    });
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
