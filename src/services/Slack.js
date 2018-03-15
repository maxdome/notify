const fetch = require('node-fetch');
const Service = require('./Service');

class Slack extends Service {
  sendNotification() {
    fetch(this.options.webhookUrl, {
      method: 'POST',
      body: JSON.stringify(this.renderedTemplate),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(err => {
      console.error(err);
    });
  }

  get serviceName() {
    return 'slack';
  }
}

module.exports = Slack;
