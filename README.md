notify
======

> Send CD / CI notifications in GitLab CI

## Install

```sh
$ npm install -g @maxdome/notify
```

## Usage

```
Usage: notify [options] [command]


Options:

  -V, --version  output the version number
  -h, --help     output usage information


Commands:

  console             Print notification to console
  hipchat [options]   Send HipChat notification
  slack [options]     Send Slack notification
```

### HipChat

```
Usage: notify hipchat [options]

Send HipChat notification


Options:

  --token <token>                 Hipchat Token
  --room <room>                   Room to send notification to
  --version-label [versionLabel]  Version which was deployed
  --changelog-url [changelogUrl]  URL to changelog
  --from [from]                   Notification sender name. Default: "GitLab CI"
  --color [color]                 Notification color [yellow|green|red|purple|gray|random]. Default: "purple"
  --format [format]               Notification format [text|html]. Default: "html"
  --silent                        Disable notification alert. Default: false
  --template [template]           Name of notification template. Default: "default"
  --print                         Print the template instead of sending it
  -h, --help                      output usage information
```

### Slack

```
Usage: notify slack [options]

Send Slack notification


Options:

  --webhook-url <webhookUrl>      Slack Webhook URL for posting notifications
  --changelog-url [changelogUrl]  URL to changelog
  --version-label [versionLabel]  Version which was deployed
  --username [username]           Username to send notification from. Default: "GitLab CI"
  --color [color]                 Color of notification. Default: "#554488"
  --template [template]           Name of the notification template to use. Default: "default"
  --print                         Print the template instead of sending it
  -h, --help                      output usage information
```

## TODO

More integrations coming soon:

- Microsoft Teams
- E-mail
