# mdk - Mattermost Development Kit (experimental)

mdk is a tool for generating and managing starting points and templates for Mattermost integrations and plugins.

## Install

```
npm install -g mdk
```

## Usage

To generate a starting point for a webapp (and desktop app) plugin in the current directory:
```
mdk init webapp
```

Switch into your the directory for your new project and code your plugin!
```
cd your-plugin
```


Once it's coded and ready, bulid it with:
```
make dist
```

For plugins this will write a distributable of your plugin to `dist/your-plugin.tar.gz`. You can then take this and upload it to your Mattermost server.


## Current Features

* Generate basic starting point for webapp and desktop plugins

## Planned Features

* More advanced features for the webapp plugin starting point (redux store, etc.)
* Generate starting point for server plugins
* Generate starting point for webhook and slash command integrations in both JavaScript and Go
* Generate starting point for OAuth2 integrations in both JavaScript and Go
* Manage generated integrations and plugins, such as adding features to an existing plugin

## Webapp Plugin Template

The [webapp plugin template](https://github.com/mattermost/mdk/tree/master/templates/webapp) contains everything you need to build a great plugin for the Mattermost web and desktop apps.

After running `mdk init webapp`, and following the steps, you should have a directory named after your plugin. Inside that directory will be the `webapp` directory and in there you will see these files and directories:

### index.js

This is the entry point for your webapp plugin. There will already be some initilization code in there that will handle registering your plugin with the Mattermost webapp. If you need to do any other set up or initialization then do it in here.

### package.json

This should be familiar if you have any experience with npm. If you're not familiar, [please take some time to read up on npm](https://www.npmjs.com/). The minimum required dependencies should already be present. Feel free to add new dependecies and npm targets as needed.

### components

The meat of your plugin will be the React components that live in this directory. Depending on the components you chose to override, different directories and files will be in here. The default props that each component has access to should already be defined. Use the `index.js` containers to supply new props and actions to the components as needed. Also include any child components you may need to build in this directory.

### client

Any web utilities you need to build for accessing different servers should be added here. If you only need to access the existing Mattermost REST API, please use [mattermost-redux](https://github.com/mattermost/mattermost-redux) (it's already included as a dependency). There should be a short example file to help illustrate the usage.

### actions

Your functions that affect the state of your plugins should live in this directory. We recommend following [the pattern used in mattermost-redux](https://github.com/mattermost/mattermost-redux/blob/master/src/actions/users.js#L1253).

### webpack.config.js

Webpack is used to bundle the modules of your webapp plugin. Everything should already be setup but make changes as necessary for your specific cases.

### README.md

The README for your webapp plugin. We recommend filling in some basic information about your plugin here.
