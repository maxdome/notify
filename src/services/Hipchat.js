const got = require('got');
const Service = require('./Service');

class Hipchat extends Service {
  sendNotification() {
    got
      .post(`https://api.hipchat.com/v2/room/${this.options.room}/notification`, {
        json: true,
        body: this.renderedTemplate,
        headers: {
          Authorization: `Bearer ${this.options.token}`,
        },
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  }

  get serviceName() {
    return 'hipchat';
  }
}

module.exports = Hipchat;
