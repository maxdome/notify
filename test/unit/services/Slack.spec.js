const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

chai.use(require('sinon-chai'));
const expect = chai.expect;
const sandbox = sinon.createSandbox();

let { Slack } = require('../../../src/services');

describe('Slack', () => {
  describe('renderTemplate()', () => {
    let slack;

    beforeEach(() => {
      slack = new Slack();
      sandbox.stub(slack, 'getCIEnvironmentVariables').returns({
        ciPipelineId: 123456,
        ciProjectName: 'Test Project',
        ciCommitSha: '77777777777777777777777777777777',
        ciEnvironmentName: 'test',
        ciEnvironmentUrl: 'http://testenv',
        ciProjectUrl: 'http://test/testproject',
      });
    });

    it('renders the default template', () => {
      slack.options.changelogUrl = 'http://changelog.test/testproject';
      slack.renderTemplate();
      expect(slack.renderedTemplate).to.be.an('object');
      expect(slack.renderedTemplate).to.eql({
        username: 'GitLab CI',
        attachments: [
          {
            fallback: 'Test Project (7777777) successfully deployed to test environment.',
            text:
              ':rocket: *<http://test/testproject|Test Project>* successfully deployed (<http://test/testproject/pipelines/123456|#123456>)',
            fields: [
              {
                title: 'Commit',
                value: '<http://test/testproject/tree/77777777777777777777777777777777|7777777>',
                short: true,
              },
              {
                title: 'Environment',
                value: '<http://testenv|test>',
                short: true,
              },
            ],
            color: '#554488',
            mrkdwn_in: ['text'],
            actions: [
              {
                type: 'button',
                text: 'View Changelog :bookmark_tabs:',
                url: 'http://changelog.test/testproject',
              },
            ],
          },
        ],
      });
    });

    afterEach(() => {
      sandbox.restore();
    });
  });

  describe('sendNotification()', () => {
    const testWebhookUrl = 'http://testwebhook';
    const testRenderedTemplate = { test: 'test' };
    let fetchMock = sandbox.stub();
    let slack;

    before(() => {
      mock('node-fetch', fetchMock);
      Slack = mock.reRequire('../../../src/services/Slack');
    });

    beforeEach(() => {
      fetchMock.resolves();
      slack = new Slack({ webhookUrl: testWebhookUrl });
      slack.renderedTemplate = testRenderedTemplate;
    });

    it('makes POST request to webhook url with stringified body', () => {
      slack.sendNotification();
      expect(fetchMock).to.have.been.calledWith(testWebhookUrl, {
        method: 'POST',
        body: JSON.stringify(testRenderedTemplate),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('catches and logs errors on failure', done => {
      const error = new Error('failure');
      sandbox.stub(console, 'error');
      fetchMock.rejects(error);
      slack.sendNotification();
      setTimeout(() => {
        expect(console.error).to.have.been.called;
        done();
      }, 10);
    });

    after(() => {
      mock.stopAll();
      sandbox.restore();
    });
  });

  describe('name()', () => {
    it('returns `slack`', () => {
      const slack = new Slack();
      expect(slack.name).to.eql('slack');
    });
  });
});
