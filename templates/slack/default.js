module.exports = (data = {}) => {
  const version =
    data.versionLabel || (data.ciCommitTag ? data.ciCommitTag + '-' : '') + data.ciCommitSha.substring(0, 7);

  const template = {
    username: data.username || 'GitLab CI',
    attachments: [
      {
        fallback: `${data.ciProjectName} (${version}) successfully deployed ${
          data.ciEnvironmentName ? 'to ' + data.ciEnvironmentName + ' environment' : ''
        }.`,
        text: `:rocket: *<${data.ciProjectUrl}|${data.ciProjectName}>* successfully deployed (<${
          data.ciProjectUrl
        }/pipelines/${data.ciPipelineId}|#${data.ciPipelineId}>)`,
        fields: [
          {
            title: data.versionLabel ? 'Version' : 'Commit',
            value: `<${data.ciProjectUrl}/tree/${data.ciCommitSha}|${version}>`,
            short: true,
          },
        ],
        color: data.color || '#554488',
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
      value: data.ciEnvironmentName
        ? `<${data.ciEnvironmentUrl}|${data.ciEnvironmentName}>`
        : data.ciEnvironmentName,
      short: true,
    });
  }

  return template;
};
