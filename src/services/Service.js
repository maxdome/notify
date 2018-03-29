const path = require('path');
const fs = require('fs');
const camelCase = require('lodash.camelcase');

class Service {
  constructor(options = {}) {
    this.options = Object.assign({}, options);
  }

  renderTemplate() {
    const data = Object.assign({}, this.getCIEnvironmentVariables(), this.options);
    const templateName = this.options.template || 'default';
    const template = require(path.resolve(__dirname, '../../templates', this.name, templateName));
    this.renderedTemplate = template(data);
  }

  getCIEnvironmentVariables() {
    return Object.keys(process.env)
      .filter(key => key.startsWith('CI_'))
      .reduce((env, key) => ((env[camelCase(key)] = process.env[key]), env), {});
  }

  printNotification() {
    console.info(JSON.stringify(this.renderedTemplate));
  }

  sendNotification() {}

  get name() {
    return '';
  }
}

module.exports = Service;
