const program = require('commander');
const pkg = require('../package.json');
const { Service, Slack, Hipchat } = require('./services');

module.exports = argv => {
  program.version(pkg.version);

  program
    .command('console')
    .description('Print notification to console')
    .option('--application-name [applicationName]', 'Name of the application. Default: $CI_PROJECT_NAME')
    .action(options => {
      const test = new Service(options);
      test.renderTemplate();
      test.printNotification();
    });

  program
    .command('hipchat')
    .description('Send HipChat notification')
    .option('--token <token>', 'Hipchat Token')
    .option('--room <room>', 'Room to send notification to')
    .option('--application-name [applicationName]', 'Name of the application. Default: $CI_PROJECT_NAME')
    .option('--version-label [versionLabel]', 'Version which was deployed. Default: $CI_COMMIT_SHA')
    .option('--changelog-url [changelogUrl]', 'URL to changelog')
    .option('--from [from]', 'Notification sender name. Default: "GitLab CI"')
    .option('--color [color]', 'Notification color [yellow|green|red|purple|gray|random]. Default: "purple"')
    .option('--format [format]', 'Notification format [text|html]. Default: "html"')
    .option('--silent', 'Disable notification alert. Default: false')
    .option('--template [template]', 'Name of notification template. Default: "default"')
    .option('--print', 'Print the template instead of sending it')
    .action(options => {
      const hipchat = new Hipchat(options);
      hipchat.renderTemplate();

      if (options.print) {
        hipchat.printNotification();
      } else {
        hipchat.sendNotification();
      }
    });

  program
    .command('slack')
    .description('Send Slack notification')
    .option('--webhook-url <webhookUrl>', 'Slack Webhohok URL for posting notifications')
    .option('--application-name [applicationName]', 'Name of the application. Default: $CI_PROJECT_NAME')
    .option('--version-label [versionLabel]', 'Version which was deployed. Default: $CI_COMMIT_SHA')
    .option('--changelog-url [changelogUrl]', 'URL to changelog')
    .option('--username [username]', 'Username to send notification from. Default: "GitLab CI"')
    .option('--color [color]', 'Color of notification. Default: "#554488"')
    .option('--template [template]', 'Name of the notification template to use. Default: "default"')
    .option('--print', 'Print the template instead of sending it')
    .action(options => {
      const slack = new Slack(options);
      slack.renderTemplate();

      if (options.print) {
        slack.printNotification();
      } else {
        slack.sendNotification();
      }
    });

  program.parse(argv);

  if (!argv.slice(2).length) {
    program.help();
  }
};

module.exports.program = program;
