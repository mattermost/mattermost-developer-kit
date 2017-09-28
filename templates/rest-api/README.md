# README for %plugin_name%

Add README information for your integration here.

## Template

Everything you need to build your integration is present in this directory.

### main.go

This is the entry point for your integration. By default it does the following:

* Loads a config file
* Uses the Go driver to get a channel by name and by team
* Posts messages to the channel on startup and shutdown
* Connects to the WebSocket and listens for new post events

Modify this file to suit your purposes. You may want to split your integration into multiple files.

### config.json

The JSON configuration file for your integration. Use this to define the configuration settings for your plugin. Some settings already exist as examples.

Optionally, replace the configuration file with your own method (environment variables, YAML, etc.).

### Makefile

A pre-built Makefile containing some useful commands:

* `make run` - Run the integration
* `make dist` - Build and package the integration for Linux, Mac OSX and Windows
* `make clean` - Clean temporary files, previous builds, etc.

Modify the Makefile to suit your needs as necessary.

### vendor

Dependencies for your integration live in this directory. [Glide](https://github.com/Masterminds/glide) is used to manage dependencies. The Mattermost Go driver is already included. Symlinks are used in the Makefile to avoid requiring your integration to be under GOPATH.

### glide.yaml and glide.lock

[See the glide documentation.](https://github.com/Masterminds/glide#how-it-works)
