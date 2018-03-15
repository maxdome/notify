module.exports = (data = {}) => {
  const version =
    data.versionLabel || (data.ciCommitTag ? data.ciCommitTag + '-' : '') + data.ciCommitSha.substring(0, 7);

  const template = {
    from: data.from || 'GitLab CI',
    color: data.color || 'purple',
    message_format: data.format || 'html',
    notify: !data.silent,
    message: `
    <a href="${data.ciProjectUrl}}"><strong>${data.applicationName || data.ciProjectName}</strong></a>
    ${data.changelogUrl ? `<a href="${data.changelogUrl}"><em>${version}</em></a>` : `<em>${version}</em>`}
    ${
      data.ciEnvironmentName
        ? `deployed to <a href="${data.ciEnvironmentUrl}"><strong>${data.ciEnvironmentName}</strong></a>`
        : 'finished'
    }
    • <a href="${data.ciProjectUrl}/pipelines/${data.ciPipelineId}">#${data.ciPipelineId}</a>
    `
      .replace(/\n/g, '')
      .trim(),
  };

  return template;
};
