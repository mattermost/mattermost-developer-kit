.PHONY: build test run clean stop check-style

check-style: .npminstall
	@echo Checking for style guide compliance

	cd webapp && npm run check

test: .npminstall
	@echo Not yet implemented

.npminstall:
	@echo Getting dependencies using npm

	cd webapp && npm install
	touch $@

build: .npminstall
	@echo Building plugin

	# Clean old dist
	rm -rf dist
	rm -rf webapp/dist
	cd webapp && npm run build

	# Copy files from webapp
	mkdir dist
	mkdir dist/webapp
	cp webapp/dist/* dist/webapp/

	# Copy files from
	cp plugin.json dist/

	# Compress
	tar -zcvf %plugin_id%.tar.gz dist/*
	mv %plugin_id%.tar.gz dist/

	# Clean up temp files
	rm -f dist/plugin.json
	rm -rf dist/webapp

	@echo Plugin built at: dist/%plugin_id%.tar.gz

run: .npminstall
	@echo Not yet implemented

stop:
	@echo Not yet implemented

clean:
	@echo Cleaning plugin

	rm -rf dist
	cd webapp && rm -rf node_modules
	cd webapp && rm -f .npminstall
