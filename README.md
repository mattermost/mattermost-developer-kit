# mdk - Mattermost Developer Kit (experimental)

mdk is a tool for generating and managing templates for Mattermost integrations and plugins.

The tool is still experimental and subject to changes.

## Install

```
npm install -g mdk
```

## Usage

1. Generate a template for a web/desktop app plugin in the current directory:
```
mdk init plugin
```

2. Switch into the plugin directory and code your plugin:
```
cd your-plugin
```

3. Once the plugin is ready, build it:
```
make build
```

This command will write a distributable of your plugin to `dist/your-plugin.tar.gz`. You can then take this and upload it to your Mattermost server.

## Current Features

* Generate basic template for web and desktop app plugins.

## Planned Features

* Advanced features for the webapp plugin template (Redux store, etc.)
* Generate templates for server plugins.
* Generate templates for webhook and slash command integrations, including bot integrations, in both JavaScript and Go.
* Generate templates for OAuth2 integrations in both JavaScript and Go.
* Manage generated integrations and plugins, such as adding features to an existing plugin.

## Webapp Plugin Template

The [webapp plugin template](https://github.com/mattermost/mdk/tree/master/templates/webapp) contains everything you need to build a plugin for the Mattermost web and desktop apps.

After running `mdk init plugin`, and following the steps above, you should have a directory named after your plugin. Inside that directory you can find a `webapp` directory with these files and directories:

### index.js

This is the entry point for your webapp plugin. Includes initilization code to handle registering your plugin with the Mattermost web and desktop apps. Use this file for additional set up or initialization.

### package.json

The minimum required dependencies will be added by default. Use this file for additional dependecies and npm targets as needed. This should be familiar if you have experience with npm, if not, [please take some time to learn about npm](https://www.npmjs.com/).

### components

The meat of your plugin will be the React components in this directory. You can find different directories and files depending on the components you chose to override. The default props that each component has access to are already defined. Use the `index.js` containers to supply new props and actions to the components as needed. Also include any child components you may need to build in this directory.

### client

Any web utilities you need to build for accessing different servers are added here. If you only need to access the existing Mattermost REST API, please use [mattermost-redux](https://github.com/mattermost/mattermost-redux), which is already included as a dependency. There should be a short example file to help illustrate the usage.

### actions

Your functions that affect the state of your plugins are in this directory. We recommend following [the pattern used in mattermost-redux](https://github.com/mattermost/mattermost-redux/blob/master/src/actions/users.js#L1253).

### webpack.config.js

Webpack is used to bundle the modules of your webapp plugin. Changes are typically not required.

### README.md

The README for your webapp plugin. We recommend filling in some basic information about your plugin here.
