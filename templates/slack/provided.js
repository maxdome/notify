module.exports = (data = {}) => {
  const version =
    data.versionLabel ||
    (data.ciCommitTag ? data.ciCommitTag + '-' : '') + (data.ciCommitSha && data.ciCommitSha.substring(0, 7));
  const name = data.applicationName || data.ciProjectName;

  const template = {
    username: data.username || 'GitLab CI',
    attachments: [
      {
        fallback: `${name} (${version}) successfully provided ${
          data.ciEnvironmentName ? 'for ' + data.ciEnvironmentName + ' environment' : ''
        }.`,
        text: `:package: *<${data.ciProjectUrl}|${name}>* successfully provided (<${data.ciProjectUrl}/pipelines/${
          data.ciPipelineId
        }|#${data.ciPipelineId}>)`,
        fields: [
          {
            title: data.versionLabel ? 'Version' : 'Commit',
            value: `<${data.ciProjectUrl}/tree/${data.ciCommitSha}|${version}>`,
            short: true,
          },
        ],
        color: data.color || '#1077ad',
        mrkdwn_in: ['text'],
        actions: [],
      },
    ],
  };

  if (data.changelogUrl) {
    template.attachments[0].actions.push({
      type: 'button',
      text: 'View Changelog :bookmark_tabs:',
      url: data.changelogUrl,
    });
  }

  if (data.ciEnvironmentName) {
    template.attachments[0].fields.push({
      title: 'Environment',
      value: data.ciEnvironmentName ? `<${data.ciEnvironmentUrl}|${data.ciEnvironmentName}>` : data.ciEnvironmentName,
      short: true,
    });
  }

  return template;
};
