const fetch = require('node-fetch');
const Service = require('./Service');

class Hipchat extends Service {
  sendNotification() {
    fetch(`https://api.hipchat.com/v2/room/${this.options.room}/notification`, {
      method: 'POST',
      body: JSON.stringify(this.renderedTemplate),
      headers: {
        Authorization: `Bearer ${this.options.token}`,
        'Content-Type': 'application/json',
      },
    }).catch(err => {
      console.error(err);
    });
  }

  get name() {
    return 'hipchat';
  }
}

module.exports = Hipchat;
