const program = require('commander');
const pkg = require('../package.json');
const got = require('got');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');

module.exports = argv => {
  program.version(pkg.version);
  program.option('-v --verbose', 'Be more verbose');

  function msg() {
    console.log(...arguments);
  }

  function handleError(err) {
    err = err instanceof Error ? err : new Error(err);
    console.error(program.verbose ? err : `Error: ${err.message}`);
    process.exit(1);
  }

  function handleResult(text) {
    if (text) {
      msg(text);
    }
  }

  function render(template, data) {
    const filename = template ? path.join(process.cwd(), template) : path.join(__dirname, '..', 'tpl', 'deploy.html');
    const tpl = Handlebars.compile(fs.readFileSync(filename, 'utf8'));
    return tpl(data).trim();
  }

  process.on('uncaughtException', err => {
    msg(err.message);
    if (program.verbose) {
      msg(err.stack);
    }
    process.exit(1);
  });

  function checkRequiredOptions(options, data) {
    Object.values(options.options).forEach(option => {
      const name = option.long.slice(2);
      if (option.required && !options.hasOwnProperty(name) && data[name] === 'unknown') {
        handleError(`option '${option.flags}' missing`);
      }
    });
  }

  program
    .command('hipchat')
    .description('Send HipChat notification')
    .option('--appName <appName>', 'Application name. Default: $CI_PROJECT_NAME, $APPLICATION_NAME')
    .option('--appVersion <appVersion>', 'Application version. Default: $APPLICATION_VERSION')
    .option('--appRevision <appRevision>', 'Application revision. Default: $APPLICATION_REVISION')
    .option(
      '--appVersionLabel <appVersionLabel>',
      'Application version label. Default: $APPLICATION_VERSION_LABEL, $ELASTIC_BEANSTALK_LABEL'
    )
    .option('--ciEnvName <ciEnvName>', 'CI environment name. Default: $CI_ENVIRONMENT_NAME')
    .option('--ciEnvUrl <ciEnvUrl>', 'CI environment URL. Default: $CI_ENVIRONMENT_URL')
    .option('--ciProjectUrl <ciProjectUrl>', 'CI project URL. Default: $CI_PROJECT_URL')
    .option('--ciPipelineId <ciPipelineId>', 'CI pipeline ID. Default: $CI_PIPELINE_ID')
    .option(
      '--jiraFixVersionOperator <jiraFixVersionOperator>',
      'JIRA fix version operator. Default: $JIRA_FIX_VERSION_OPERATOR'
    )
    .option('--jiraQuery <jiraQuery>', 'JIRA query for project. Default: $JIRA_QUERY')
    .option('--jiraBaseUrl [jiraBaseUrl]', 'JIRA base URL. Default: $JIRA_BASE_URL')
    .option('--from [from]', 'Notification sender name. Default: "GitLab CI"')
    .option('--color [color]', 'Notification color [yellow|green|red|purple|gray|random]. Default: "purple"')
    .option('--format [format]', 'Notification format [text|html]. Default: "html"')
    .option('--silent', 'Disable notification alert. Default: false')
    .option('--hipChatToken [hipChatToken]', 'HipChat bearer token. Default: $HIPCHAT_AUTH_TOKEN')
    .option('--template [template]', 'Path to notification template literal')
    .option('--data [data]', 'Additional template data in JSON format')
    .action(options => {
      const data = Object.assign(
        {
          jiraBaseUrl:
            process.env.JIRA_BASE_URL ||
            'https://jira.sim-technik.de/issues/?jql={jiraQuery}%20AND%20fixVersion{jiraFixVersionOperator}{appVersion}',
          appName: process.env.APPLICATION_NAME || process.env.CI_PROJECT_NAME,
          appVersion: process.env.APPLICATION_VERSION,
          appRevision: process.env.APPLICATION_REVISION,
          appVersionLabel: process.env.APPLICATION_VERSION_LABEL || process.env.ELASTIC_BEANSTALK_LABEL,
          ciEnvUrl: process.env.CI_ENVIRONMENT_URL,
          ciEnvName: process.env.CI_ENVIRONMENT_NAME,
          ciProjectUrl: process.env.CI_PROJECT_URL,
          ciPipelineId: process.env.CI_PIPELINE_ID,
          jiraQuery: process.env.JIRA_QUERY,
          jiraFixVersionOperator: process.env.JIRA_FIX_VERSION_OPERATOR,
        },
        options
      );
      if (options.data) {
        try {
          Object.assign(data, JSON.parse(options.data));
        } catch (e) {
          handleError(`invalid JSON data in option 'data'`);
        }
        delete data.data;
      }
      data.jiraUrl = data.jiraBaseUrl
        .replace(/\{appVersion\}/g, data.appVersion)
        .replace(/\{jiraQuery\}/g, data.jiraQuery)
        .replace(/\{jiraFixVersionOperator\}/g, data.jiraFixVersionOperator || '%3D');

      checkRequiredOptions(options, data);

      const headers = {
        Authorization: `Bearer ${options.hipChatToken || process.env.HIPCHAT_AUTH_TOKEN}`,
      };

      const body = {
        from: options.from || process.env.HIPCHAT_FROM || 'GitLab CI',
        color: options.color || process.env.HIPCHAT_COLOR || 'purple',
        message_format: options.format || process.env.HIPCHAT_FORMAT || 'html',
        notify: !process.env.HIPCHAT_SILENT && !options.silent,
        message: render(options.template, data),
      };

      try {
        got
          .post(`https://api.hipchat.com/v2/room/${options.roomId || 'Public%20Deployments'}/notification`, {
            json: true,
            body,
            headers,
          })
          .then(handleResult)
          .catch(handleError);
      } catch (e) {
        handleError(e);
      }
    });

  program.parse(argv);

  if (!argv.slice(2).length) {
    program.help();
  }
};
module.exports.program = program;
