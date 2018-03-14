const path = require('path');
const fs = require('fs');
const camelCase = require('lodash.camelcase');

class Service {
  constructor(options = {}) {
    this.options = Object.assign({}, options);
  }

  createTemplate() {
    this.templateData = this.getTemplateData();
    this.renderedTemplate = this.renderTemplate(this.templateData);
  }

  renderTemplate(data) {
    const templateName = this.options.template || 'default';
    const template = require(path.resolve(__dirname, '../../templates', this.serviceName, templateName));
    return template(data);
  }

  getCIEnvironmentVariables() {
    return Object.keys(process.env)
      .filter(key => key.startsWith('CI_'))
      .reduce((env, key) => ((env[camelCase(key)] = process.env[key]), env), {});
  }

  getTemplateData() {
    return Object.assign({}, this.getCIEnvironmentVariables(), this.options);
  }

  printNotification() {
    console.info(JSON.stringify(this.renderedTemplate));
  }

  sendNotification() {}

  get serviceName() {
    return '';
  }
}

module.exports = Service;
