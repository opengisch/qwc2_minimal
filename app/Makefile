QWC2_VERSION_HASH="86ba224001cd3c9813ad645f4ccf4de7a17db801"
QWC2_REPO_URL="https://github.com/qgis/qwc2.git"
QWC2_FOLDER="qwc2"

qwc2/.timestamp-clone:
	git clone $(QWC2_REPO_URL) $(QWC2_FOLDER)
	touch $@

qwc2/.timestamp-checkout: qwc2/.timestamp-clone
	cd $(QWC2_FOLDER) && git checkout $(QWC2_VERSION_HASH)

node_modules/.timestamp-install: qwc2/.timestamp-checkout
	yarn install
	touch $@

prod/.timestamp-build: node_modules/.timestamp-install
	npm run tsupdate 
	npm run iconfont
# npm run themesconfig

	node_modules/webpack/bin/webpack.js --mode production --progress
	echo "<!-- Built: $(shell date -R) -->" >> ./prod/index.html
	echo "<!-- Built: $(QWC2_VERSION_HASH) -->" >> ./prod/index.html
	echo "<!-- Built: $(QWC2_REPO_URL) -->" >> ./prod/index.html
	echo "$(shell date -R)" >> ./prod/version.txt
	echo "$(QWC2_VERSION_HASH)" >> ./prod/version.txt
	echo "$(QWC2_REPO_URL)" >> ./prod/version.txt
	touch $@

.PHONY: install
install: node_modules/.timestamp-install

.PHONY: serve-dev
serve-dev: install
	yarn start

.PHONY: clean
clean:
	rm -rf qwc2
	rm -rf node_modules
	rm -rf .cache
	rm -rf prod
	rm -rf dist

.PHONY: build
build: prod/.timestamp-build
