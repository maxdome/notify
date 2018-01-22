const mock = require('mock-require');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('[Unit] cli.js', () => {
  let cli;
  let gotStub = sinon.stub();
  let previousEnvKeys;
  const defaultArgs = ['/bin/node', '/notify'];

  function runCmd(args) {
    gotStub.reset();
    cli(args);
    const actualMessage = gotStub.firstCall.args[1].body.message;
    const expectedResponse = {
      json: true,
      body: {
        from: 'GitLab CI',
        color: 'purple',
        message_format: 'html',
        notify: true,
        message: gotStub.firstCall.args[1].body.message,
      },
      headers: { Authorization: 'Bearer undefined' },
    };

    expect(gotStub).to.have.been.calledWith(
      'https://api.hipchat.com/v2/room/Public%20Deployments/notification',
      expectedResponse
    );

    return actualMessage;
  }

  before(() => {
    mock('got', { post: gotStub });
    cli = require('../src/cli');
    previousEnvKeys = Object.keys(process.env);
  });

  afterEach(() => {
    cli.program._events = {}; // Clean up commander events
    for (let i in process.env) {
      if (!previousEnvKeys.includes(i)) {
        delete process.env[i];
      }
    }
  });

  it('renders boringly without links', () => {
    const args = defaultArgs.concat(
      'hipchat',
      '--appName',
      'Windows',
      '--appVersion',
      '95',
      '--ciPipelineId',
      '666',
      '--ciEnvName',
      'stage'
    );
    const message = runCmd(args);
    expect(message).to.contain('<strong>Windows</strong>\n');
    expect(message).to.contain('<em>v95</em>\n');
    expect(message).to.contain('<strong>stage</strong>\n');
    expect(message).to.contain('<a href="/pipelines/666">#666</a>');
  });
  it('renders excitingly with links everywhere', () => {
    const args = defaultArgs.concat(
      'hipchat',
      '--appName',
      'Windows',
      '--appVersion',
      '95',
      '--appRevision',
      '1234567',
      '--jiraQuery',
      'bluescreen%3Dalways',
      '--ciProjectUrl',
      'http://github.com/windows/95',
      '--ciPipelineId',
      '666',
      '--ciEnvUrl',
      'http://windows95.com',
      '--ciEnvName',
      'stage'
    );
    const message = runCmd(args);
    expect(message).to.contain('<a href="http://github.com/windows/95"><strong>Windows</strong></a>\n');
    expect(message).to.contain(
      '<a href="https://jira.sim-technik.de/issues/?jql=bluescreen%3Dalways%20AND%20fixVersion%3D95"><em>v95-1234567</em></a>\n'
    );
    expect(message).to.contain('<a href="http://windows95.com"><strong>stage</strong></a>\n');
    expect(message).to.contain('<a href="http://github.com/windows/95/pipelines/666">#666</a>');
  });
  it('accepts environment variables', () => {
    const args = defaultArgs.concat('hipchat');
    process.env.APPLICATION_NAME = 'Windows';
    process.env.APPLICATION_VERSION = '95';
    process.env.APPLICATION_REVISION = '1234567';
    process.env.JIRA_QUERY = 'bluescreen%3Dalways';
    process.env.CI_PROJECT_URL = 'http://github.com/windows/95';
    process.env.CI_PIPELINE_ID = '666';
    process.env.CI_ENVIRONMENT_URL = 'http://windows95.com';
    process.env.CI_ENVIRONMENT_NAME = 'stage';
    const message = runCmd(args);
    expect(message).to.contain('<a href="http://github.com/windows/95"><strong>Windows</strong></a>\n');
    expect(message).to.contain(
      '<a href="https://jira.sim-technik.de/issues/?jql=bluescreen%3Dalways%20AND%20fixVersion%3D95"><em>v95-1234567</em></a>\n'
    );
    expect(message).to.contain('<a href="http://windows95.com"><strong>stage</strong></a>\n');
    expect(message).to.contain('<a href="http://github.com/windows/95/pipelines/666">#666</a>');
  });
  it('prefers --appVersionLabel over --appVersion and --appRevision', () => {
    const args = defaultArgs.concat(
      'hipchat',
      '--appVersion',
      '95',
      '--appRevision',
      '1234567',
      '--appVersionLabel',
      'v95.0.0'
    );
    const message = runCmd(args);
    expect(message).to.contain('<em>v95.0.0</em>\n');
  });
  it('prefers APPLICATION_VERSION_LABEL over APPLICATION_VERSION and APPLICATION_REVISION', () => {
    const args = defaultArgs.concat('hipchat');
    process.env.APPLICATION_NAME = 'Windows';
    process.env.APPLICATION_VERSION = '95';
    process.env.APPLICATION_REVISION = '1234567';
    process.env.APPLICATION_VERSION_LABEL = 'v95.0.0';
    const message = runCmd(args);
    expect(message).to.contain('<em>v95.0.0</em>\n');
  });
  it('accepts --jiraFixVersionOperator', () => {
    const args = defaultArgs.concat(
      'hipchat',
      '--appVersion',
      '95',
      '--jiraQuery',
      'bluescreen%3Dalways',
      '--jiraFixVersionOperator',
      '%3E%3D'
    );
    const message = runCmd(args);
    expect(message).to.contain(
      '<a href="https://jira.sim-technik.de/issues/?jql=bluescreen%3Dalways%20AND%20fixVersion%3E%3D95"><em>v95</em></a>\n'
    );
  });
  it('accepts a custom --template', () => {
    const args = defaultArgs.concat(
      'hipchat',
      '--template',
      'test/test.html',
      '--appName',
      'Windows',
      '--appVersion',
      'ME'
    );
    const message = runCmd(args);
    expect(message).to.contain('<h1>Refusing to deploy Windows ME!</h1>');
  });
  it('accepts --data', () => {
    const args = defaultArgs.concat(
      'hipchat',
      '--template',
      'test/test.html',
      '--appName',
      'Windows',
      '--appVersion',
      'ME',
      '--data',
      '{"action": "install"}'
    );
    const message = runCmd(args);
    expect(message).to.contain('<h1>Refusing to install Windows ME!</h1>');
  });
});
