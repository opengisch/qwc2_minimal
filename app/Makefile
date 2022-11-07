
QWC2_VERSION_HASH=$(shell cat /qwc2/.qwc2.version.txt)
QWC2_REPO_URL=$(shell cat /qwc2/.qwc2.download_source.txt)

prod/.timestamp-build: install
	node /qwc2/scripts/updateTranslations.js
	node /qwc2/scripts/makeIconkit.js
	/node_modules/webpack/bin/webpack.js --mode production --progress
	echo "<!-- Built: $(shell date -R) -->" >> ./prod/index.html
	echo "<!-- Built: $(QWC2_VERSION_HASH) -->" >> ./prod/index.html
	echo "<!-- Built: $(QWC2_REPO_URL) -->" >> ./prod/index.html
	echo "$(shell date -R)" >> ./prod/version.txt
	echo "$(QWC2_VERSION_HASH)" >> ./prod/version.txt
	echo "$(QWC2_REPO_URL)" >> ./prod/version.txt
	touch $@

.PHONY: install
install: package.json
	yarn install

.PHONY: serve-dev
serve-dev: install
	node /qwc2/scripts/updateTranslations.js
	node /qwc2/scripts/makeIconkit.js
	/node_modules/webpack/bin/webpack.js serve --mode development --progress --host 0.0.0.0 --port $(DEV_SERVER_PORT)

.PHONY: clean
clean:
	rm -rf qwc2
	rm -rf node_modules
	rm -rf .cache
	rm -rf prod
	rm -rf dist

.PHONY: build
build: prod/.timestamp-build

.PHONY: generate-themes
generate-themes: themesConfig.json
	node /qwc2/scripts/themesConfig.js
