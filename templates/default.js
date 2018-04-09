module.exports = (data = {}) =>
  `
#${data.ciPipelineId}: ${data.applicationName || data.ciProjectName} (${
    data.ciCommitTag ? data.ciCommitTag + '-' : ''
  }${data.ciCommitSha && data.ciCommitSha.substring(0, 7)}) ${
    data.ciEnvironmentName ? 'deployed to ' + data.ciEnvironmentName : 'finished'
  }
`.trim();
