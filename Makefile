BOOTSTRAP = ./docs/assets/css/bootstrap.css
BOOTSTRAP_LESS = ./less/bootstrap.less
BOOTSTRAP_RESPONSIVE = ./docs/assets/css/bootstrap-responsive.css
BOOTSTRAP_RESPONSIVE_LESS = ./less/responsive.less
JASNY_BOOTSTRAP_LESS = ./less/jasny/bootstrap.less
JASNY_BOOTSTRAP_RESPONSIVE_LESS = ./less/jasny/responsive.less
DATE=$(shell date +%I:%M%p)
CHECK=\033[32m✔\033[39m
HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#


#
# BUILD DOCS
#

build:
	@echo "\n${HR}"
	@echo "Building Bootstrap..."
	@echo "${HR}\n"
	@jshint js/*.js --config js/.jshintrc
	@jshint js/tests/unit/*.js --config js/.jshintrc
	@echo "Running JSHint on javascript...             ${CHECK} Done"
	@recess --compile ${JASNY_BOOTSTRAP_LESS} ${BOOTSTRAP_LESS} > ${BOOTSTRAP}
	@recess --compile ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} ${BOOTSTRAP_RESPONSIVE_LESS} > ${BOOTSTRAP_RESPONSIVE}
	@echo "Compiling LESS with Recess...               ${CHECK} Done"
	@node docs/build
	@cp img/* docs/assets/img/
	@cp js/*.js docs/assets/js/
	@cp -r fonts docs/assets/
	@cp js/tests/vendor/jquery.js docs/assets/js/
	@echo "Compiling documentation...                  ${CHECK} Done"
	@cat js/bootstrap-transition.js js/bootstrap-alert.js js/bootstrap-button.js js/bootstrap-carousel.js js/bootstrap-collapse.js js/bootstrap-dropdown.js js/bootstrap-modal.js js/bootstrap-tooltip.js js/bootstrap-popover.js js/bootstrap-scrollspy.js js/bootstrap-tab.js js/bootstrap-typeahead.js js/bootstrap-affix.js  js/bootstrap-inputmask.js js/bootstrap-rowlink.js js/bootstrap-fileupload.js > docs/assets/js/bootstrap.js
	@uglifyjs -nc docs/assets/js/bootstrap.js > docs/assets/js/bootstrap.min.tmp.js
	@echo "/**\n* Bootstrap.js v2.1.2 by @fat & @mdo\n* Copyright 2012 Twitter, Inc.\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > docs/assets/js/copyright.js
	@cat docs/assets/js/copyright.js docs/assets/js/bootstrap.min.tmp.js > docs/assets/js/bootstrap.min.js
	@rm docs/assets/js/copyright.js docs/assets/js/bootstrap.min.tmp.js
	@echo "Compiling and minifying javascript...       ${CHECK} Done"
	@echo "\n${HR}"
	@echo "Bootstrap successfully built at ${DATE}."
	@echo "${HR}\n"
	@echo "Thanks for using Bootstrap,"
	@echo "<3 @mdo and @fat\n"

#
# RUN JSHINT & QUNIT TESTS IN PHANTOMJS
#

test:
	jshint js/*.js --config js/.jshintrc
	jshint js/tests/unit/*.js --config js/.jshintrc
	node js/tests/server.js &
	phantomjs js/tests/phantom.js "http://localhost:3000/js/tests"
	kill -9 `cat js/tests/pid.txt`
	rm js/tests/pid.txt

#
# CLEANS THE ROOT DIRECTORY OF PRIOR BUILDS
#

clean:
	rm -r bootstrap

#
# BUILD SIMPLE BOOTSTRAP DIRECTORY
# recess & uglifyjs are required
#

bootstrap:
	mkdir -p bootstrap/img
	mkdir -p bootstrap/css
	mkdir -p bootstrap/js
	mkdir -p bootstrap/fonts
	cp img/* bootstrap/img/
	cp fonts/* bootstrap/fonts/
	recess --compile ${BOOTSTRAP_LESS} ${JASNY_BOOTSTRAP_LESS} > bootstrap/css/bootstrap.css
	recess --compress ${BOOTSTRAP_LESS} ${JASNY_BOOTSTRAP_LESS} > bootstrap/css/bootstrap.min.css
	recess --compile ${BOOTSTRAP_RESPONSIVE_LESS} ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} > bootstrap/css/bootstrap-responsive.css
	recess --compress ${BOOTSTRAP_RESPONSIVE_LESS} ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} > bootstrap/css/bootstrap-responsive.min.css
	cat js/bootstrap-transition.js js/bootstrap-alert.js js/bootstrap-button.js js/bootstrap-carousel.js js/bootstrap-collapse.js js/bootstrap-dropdown.js js/bootstrap-modal.js js/bootstrap-tooltip.js js/bootstrap-popover.js js/bootstrap-scrollspy.js js/bootstrap-tab.js js/bootstrap-typeahead.js js/bootstrap-affix.js  js/bootstrap-inputmask.js js/bootstrap-rowlink.js js/bootstrap-fileupload.js > bootstrap/js/bootstrap.js
# BUILD SIMPLE JASNY-BOOTSTRAP DIRECTORY
# recess & uglifyjs are required
#

jasny-bootstrap:
	mkdir -p jasny-bootstrap/css
	mkdir -p jasny-bootstrap/js
	mkdir -p jasny-bootstrap/fonts
	cp js/bootstrap-inputmask.js js/bootstrap-rowlink.js js/bootstrap-fileupload.js jasny-bootstrap/js
	cp fonts/* jasny-bootstrap/fonts/
	recess --compile ${JASNY_BOOTSTRAP_LESS} > jasny-bootstrap/css/jasny-bootstrap.css
	recess --compress ${JASNY_BOOTSTRAP_LESS} > jasny-bootstrap/css/jasny-bootstrap.min.css
	recess --compile ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} > jasny-bootstrap/css/jasny-bootstrap-responsive.css
	recess --compress ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} > jasny-bootstrap/css/jasny-bootstrap-responsive.min.css
	cat js/bootstrap-inputmask.js js/bootstrap-rowlink.js js/bootstrap-fileupload.js > jasny-bootstrap/js/jasny-bootstrap.js
	uglifyjs -nc jasny-bootstrap/js/jasny-bootstrap.js > jasny-bootstrap/js/jasny-bootstrap.min.tmp.js
	echo "/*!\n* Jasny-Bootstrap.js by @ArnoldDaniels\n* Copyright 2012 Jasny BV.\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > jasny-bootstrap/js/copyright.js
	cat jasny-bootstrap/js/copyright.js jasny-bootstrap/js/jasny-bootstrap.min.tmp.js > jasny-bootstrap/js/jasny-bootstrap.min.js
	rm jasny-bootstrap/js/copyright.js jasny-bootstrap/js/jasny-bootstrap.min.tmp.js

#
# MAKE FOR GH-PAGES 4 FAT & MDO ONLY (O_O  )
#

gh-pages: bootstrap jasny-bootstrap docs
	rm -f docs/assets/bootstrap.zip
	zip -r docs/assets/bootstrap.zip bootstrap
	rm -r bootstrap
	rm -f ../bootstrap-gh-pages/assets/bootstrap.zip
	rm -f docs/assets/jasny-bootstrap.zip
	zip -r docs/assets/jasny-bootstrap.zip jasny-bootstrap
	rm -r jasny-bootstrap
	rm -f ../bootstrap-gh-pages/assets/jasny-bootstrap.zip
	node docs/build production
	cp -r docs/* ../bootstrap-gh-pages

#
# WATCH LESS FILES
#

watch:
	echo "Watching less files..."; \
	watchr -e "watch('less/.*\.less') { system 'make' }"

#
# HAUNT GITHUB ISSUES 4 FAT & MDO ONLY (O_O  )
#

haunt:
	@haunt .issue-guidelines.js https://github.com/twitter/bootstrap


.PHONY: docs watch gh-pages
