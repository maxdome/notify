const program = require('commander');
const pkg = require('../package.json');
const got = require('got');
const path = require('path');
const fs = require('fs');

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

  function handleResult(text, code) {
    code = code || 0;

    if (text) {
      msg(text);
    }

    process.exit(code);
  }

  function render(strings, ...values) {
    let out = '';
    strings.forEach((str, i) => {
      out += `${str}${values[i] || ''}`;
    });
    return out;
  }

  function getTemplate(template, data) {
    const file = template ? path.join(process.cwd(), template) : path.join(__dirname, '../tpl/deploy.html');
    let message;
    try {
      const func = new Function('return `' + fs.readFileSync(file, 'utf8') + '`;');
      message = render`${func.call(data)}`;
    } catch (e) {
      handleError(e);
    }
    return message;
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
    .option('--appName <appName>', 'Application name')
    .option('--jiraFixVersion <jiraFixVersion>', 'JIRA fix version')
    .option('--label <label>', 'Elastic Beanstalk label')
    .option('--ciEnvName <ciEnvName>', 'CI environment name')
    .option('--ciEnvUrl <ciEnvUrl>', 'CI environment URL')
    .option('--ciProjectUrl <ciEnvUrl>', 'CI project URL')
    .option('--ciPipelineId <ciPipelineId>', 'CI pipeline ID')
    .option('--jiraBaseUrl [jiraBaseUrl]', 'JIRA base URL')
    .option('--from [from]', 'Notification sender name')
    .option('--color [color]', 'Notification color [yellow, green, red, purple, gray, random]')
    .option('--format [format]', 'Notification format [text|html]')
    .option('--silent', 'Disable notification alert')
    .option(
      '--hipChatToken [hipChatToken]',
      'HipChat bearer token. Prefer HIPCHAT_TOKEN env variable over this option!'
    )
    .option('--template [template]', 'Path to notification template literal')
    .action(async options => {
      const data = Object.assign(
        {
          jiraBaseUrl: process.env.JIRA_BASE_URL || 'https://jira.sim-technik.de/issues/?jql=$JIRA_QUERY%20AND%20fixVersion%3D',
          appName: process.env.APPLICATION_NAME || 'unknown',
          jiraFixVersion: process.env.APPLICATION_VERSION || 'unknown',
          label: process.env.ELASTIC_BEANSTALK_LABEL || 'unknown',
          ciEnvUrl: process.env.CI_ENVIRONMENT_URL || 'unknown',
          ciEnvName: process.env.CI_ENVIRONMENT_NAME || 'unknown',
          ciProjectUrl: process.env.CI_PROJECT_URL || 'unknown',
          ciPipelineId: process.env.CI_PIPELINE_ID || 'unknown',
        },
        options
      );

      checkRequiredOptions(options, data);

      const headers = {
        Authorization: `Bearer ${options.hipChatToken || process.env.HIPCHAT_TOKEN}`,
      };

      const body = {
        from: options.from || process.env.HIPCHAT_FROM || 'GitLab CI',
        color: options.color || process.env.HIPCHAT_COLOR || 'purple',
        message_format: options.format || process.env.HIPCHAT_FORMAT || 'html',
        notify: !process.env.HIPCHAT_SILENT && !options.silent,
        message: getTemplate(options.template, data),
      };

      try {
        await got.post(`https://api.hipchat.com/v2/room/${options.roomId || 'Public%20Deployments'}/notification`, {
          json: true,
          body,
          headers,
        });
        handleResult('Notification sent.');
      } catch (e) {
        handleError(e);
      }
    });

  program.parse(argv);

  if (!argv.slice(2).length) {
    program.help();
  }
};
