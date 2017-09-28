# mdk - Mattermost Developer Kit (experimental)

mdk is a tool for generating and managing templates for Mattermost integrations and plugins in Go and JavaScript.

The tool is still experimental and subject to changes.

## Install

```
npm install -g mdk
```

## Usage

```
mdk init --help
```

### Plugins

1. Generate a template for a web/desktop app plugin in the current directory:
```
mdk init plugin
```

2. Switch into the plugin directory and code your plugin:
```
cd your-plugin
```
[See the template explanation for more information](https://github.com/mattermost/mdk/tree/master/templates/webapp/README.md#template)

3. Once the plugin is ready, build it:
```
make build
```

### Integrations

1. Generate an integration in the current directory:
```
mdk init integration
```

2. Switch into the integration directory and code your integration:
```
cd your-integration
```
[See the template explanation for more information](https://github.com/mattermost/mdk/tree/master/templates/rest-api/README.md#template)

3. To test your integration, run it:
```
make run
```

4. Once done, build distributables for Linux, Mac OSX and Windows:
```
make dist
```

This command will write a distributable of your plugin to `dist/your-plugin.tar.gz`. You can then take this and upload it to your Mattermost server.

## Current Features

* Generate template for web and desktop app plugins.
* Generate template for REST API integrations.

## Planned Features

* Advanced features for the webapp plugin template (Redux store, etc.)
* Generate templates for server plugins.
* Generate templates for webhook and slash command integrations, including bot integrations, in both JavaScript and Go.
* Generate templates for OAuth2 integrations in both JavaScript and Go.
* Manage generated integrations and plugins, such as adding features to an existing plugin.

## Templates

Explanations of each of the different templates can be found in their respective READMEs:

* [Plugins](https://github.com/mattermost/mdk/tree/master/templates/plugins/README.md#template)
 * [Webapp](https://github.com/mattermost/mdk/tree/master/templates/webapp/README.md#template)
* Integrations
 * [REST API](https://github.com/mattermost/mdk/tree/master/templates/rest-api/README.md#template)

