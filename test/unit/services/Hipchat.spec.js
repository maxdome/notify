const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

chai.use(require('sinon-chai'));
const expect = chai.expect;
const sandbox = sinon.createSandbox();

let { Hipchat } = require('../../../src/services');

describe('Hipchat', () => {
  describe('renderTemplate()', () => {
    let hipchat;

    beforeEach(() => {
      hipchat = new Hipchat();
      sandbox.stub(hipchat, 'getCIEnvironmentVariables').returns({
        ciPipelineId: 123456,
        ciProjectName: 'Test Project',
        ciCommitSha: '77777777777777777777777777777777',
        ciEnvironmentName: 'test',
        ciEnvironmentUrl: 'http://testenv',
        ciProjectUrl: 'http://test/testproject',
      });
    });

    it('renders the default template', () => {
      hipchat.options.changelogUrl = 'http://changelog.test/testproject';
      hipchat.renderTemplate();
      expect(hipchat.renderedTemplate).to.be.an('object');
      expect(hipchat.renderedTemplate).to.eql({
        from: 'GitLab CI',
        color: 'purple',
        message_format: 'html',
        notify: true,
        message:
          '<a href="http://test/testproject}"><strong>Test Project</strong></a>    <a href="http://changelog.test/testproject"><em>7777777</em></a>    deployed to <a href="http://testenv"><strong>test</strong></a>    • <a href="http://test/testproject/pipelines/123456">#123456</a>',
      });
    });

    afterEach(() => {
      sandbox.restore();
    });
  });

  describe('sendNotification()', () => {
    const testToken = 'testToken';
    const testRoom = 'testRoom';
    const testRenderedTemplate = { test: 'test' };
    let fetchMock = sandbox.stub();
    let hipchat;

    before(() => {
      mock('node-fetch', fetchMock);
      Hipchat = mock.reRequire('../../../src/services/Hipchat');
    });

    beforeEach(() => {
      fetchMock.resolves();
      hipchat = new Hipchat({ token: testToken, room: testRoom });
      hipchat.renderedTemplate = testRenderedTemplate;
    });

    it('makes POST request to webhook url with stringified body', () => {
      hipchat.sendNotification();
      expect(fetchMock).to.have.been.calledWith(`https://api.hipchat.com/v2/room/${testRoom}/notification`, {
        method: 'POST',
        body: JSON.stringify(testRenderedTemplate),
        headers: {
          Authorization: `Bearer ${testToken}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('catches and logs errors on failure', done => {
      const error = new Error('failure');
      sandbox.stub(console, 'error');
      fetchMock.rejects(error);
      hipchat.sendNotification();
      setTimeout(() => {
        expect(console.error).to.have.been.called;
        done();
      }, 0);
    });

    after(() => {
      mock.stopAll();
      sandbox.restore();
    });
  });

  describe('name()', () => {
    it('returns `slack`', () => {
      const slack = new Hipchat();
      expect(slack.name).to.eql('hipchat');
    });
  });
});
