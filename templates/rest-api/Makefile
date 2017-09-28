.PHONY: run dist package build build-linux build-osx build-windows

# Golang Flags
GOPATH = $(shell pwd)
GOFLAGS ?= $(GOFLAGS:)
GO=go

DIST_ROOT=dist
DIST_PATH=$(DIST_ROOT)/%plugin_id%

BIN_PATH=bin

run:
	@ln -sf ./vendor ./src
	@$(GO) run $(GOFLAGS) $(GO_LINKER_FLAGS) *.go
	@rm src

dist: build package

build-linux:
	@echo Build Linux amd64
	@ln -sf ./vendor ./src
	env GOOS=linux GOARCH=amd64 GOPATH=$(shell pwd) $(GO) build  -o $(BIN_PATH)/%plugin_id%-linux $(GOFLAGS) ./
	@rm src

build-osx:
	@echo Build OSX amd64
	@ln -sf ./vendor ./src
	env GOOS=darwin GOARCH=amd64 GOPATH=$(shell pwd) $(GO) build  -o $(BIN_PATH)/%plugin_id%-osx $(GOFLAGS) ./
	@rm src

build-windows:
	@echo Build Windows amd64
	@ln -sf ./vendor ./src
	env GOOS=windows GOARCH=amd64 GOPATH=$(shell pwd) $(GO) build  -o $(BIN_PATH)/%plugin_id%.exe $(GOFLAGS) ./
	@rm src

build: build-linux build-osx build-windows

package:
	@ echo Packaging integration

	@# Remove any old files
	rm -Rf $(DIST_ROOT)

	@# Create needed directories
	mkdir -p $(DIST_PATH)/bin

	@# Copy over config
	cp config.json $(DIST_PATH)/config.json

	@# Package for osx
	cp $(BIN_PATH)/%plugin_id%-osx $(DIST_PATH)/bin/%plugin_id%
	tar -C dist -czf $(DIST_PATH)-osx-amd64.tar.gz %plugin_id%
	rm -f $(DIST_PATH)/bin/%plugin_id%

	@# Package for windows
	cp $(BIN_PATH)/%plugin_id%.exe $(DIST_PATH)/bin/
	cd $(DIST_ROOT) && zip -9 -r -q -l %plugin_id%-windows-amd64.zip %plugin_id% && cd ..
	rm -f $(DIST_PATH)/bin/%plugin_id%.exe

	@# Package for linux
	cp $(BIN_PATH)/%plugin_id%-linux $(DIST_PATH)/bin/%plugin_id%
	tar -C dist -czf $(DIST_PATH)-linux-amd64.tar.gz %plugin_id%
	rm -f $(DIST_PATH)/bin/%plugin_id%

	@# Clean up
	rm -Rf $(DIST_PATH)

clean:
	@ echo Cleaning

	rm -Rf $(DIST_ROOT)
	rm -Rf $(BIN_PATH)
	rm -f cover.out
	rm -f *.out
