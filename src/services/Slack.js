const got = require('got');
const Service = require('./Service');

class Slack extends Service {
  sendNotification() {
    got
      .post(this.options.webhookUrl, {
        json: true,
        body: this.renderedTemplate,
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  }

  get serviceName() {
    return 'slack';
  }
}

module.exports = Slack;
