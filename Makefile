BOOTSTRAP = ./docs/assets/css/bootstrap.css
BOOTSTRAP_LESS = ./less/bootstrap.less
BOOTSTRAP_RESPONSIVE = ./docs/assets/css/bootstrap-responsive.css
BOOTSTRAP_RESPONSIVE_LESS = ./less/responsive.less
JASNY_BOOTSTRAP_LESS = ./less/jasny-bootstrap.less
JASNY_BOOTSTRAP_RESPONSIVE_LESS = ./less/jasny-responsive.less
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
	@./node_modules/.bin/jshint js/*.js --config js/.jshintrc
	@./node_modules/.bin/jshint js/tests/unit/*.js --config js/.jshintrc
	@echo "Running JSHint on javascript...             ${CHECK} Done"
	@./node_modules/.bin/recess --compile ${JASNY_BOOTSTRAP_LESS} ${BOOTSTRAP_LESS} > ${BOOTSTRAP}
	@./node_modules/.bin/recess --compile ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} ${BOOTSTRAP_RESPONSIVE_LESS} > ${BOOTSTRAP_RESPONSIVE}
	@echo "Compiling LESS with Recess...               ${CHECK} Done"
	@node docs/build
	@cp img/* docs/assets/img/
	@cp js/*.js docs/assets/js/
	@cp -r font docs/assets/
	@cp js/tests/vendor/jquery.js docs/assets/js/
	@echo "Compiling documentation...                  ${CHECK} Done"
	@cat js/bootstrap-transition.js js/bootstrap-alert.js js/bootstrap-button.js js/bootstrap-carousel.js js/bootstrap-collapse.js js/bootstrap-dropdown.js js/bootstrap-modal.js js/bootstrap-tooltip.js js/bootstrap-popover.js js/bootstrap-scrollspy.js js/bootstrap-tab.js js/bootstrap-typeahead.js js/bootstrap-inputmask.js js/bootstrap-rowlink.js js/bootstrap-fileupload.js js/bootstrap-affix.js > docs/assets/js/bootstrap.js
	@./node_modules/.bin/uglifyjs -nc docs/assets/js/bootstrap.js > docs/assets/js/bootstrap.min.tmp.js
	@echo "/**\n* Bootstrap.js v2.3.1-j6 by @fat & @mdo extended by @ArnoldDaniels\n* Copyright 2012 Twitter, Inc.\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > docs/assets/js/copyright.js
	@cat docs/assets/js/copyright.js docs/assets/js/bootstrap.min.tmp.js > docs/assets/js/bootstrap.min.js
	@rm docs/assets/js/copyright.js docs/assets/js/bootstrap.min.tmp.js
	@echo "Compiling and minifying javascript...       ${CHECK} Done"
	@echo "\n${HR}"
	@echo "Bootstrap successfully built at ${DATE}."
	@echo "${HR}\n"
	@echo "Thanks for using Jasny Bootstrap,"
	@echo "<3 @mdo, @fat & @ArnoldDaniels\n"

#
# RUN JSHINT & QUNIT TESTS IN PHANTOMJS
#

test:
	./node_modules/.bin/jshint js/*.js --config js/.jshintrc
	./node_modules/.bin/jshint js/tests/unit/*.js --config js/.jshintrc
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

bootstrap: bootstrap-img bootstrap-css bootstrap-js

jasny-bootstrap: jasny-bootstrap-img jasny-bootstrap-font jasny-bootstrap-css jasny-bootstrap-js


#
# JS COMPILE
#
bootstrap-js: bootstrap/js/*.js

bootstrap/js/*.js: js/*.js
	mkdir -p bootstrap/js
	cat js/bootstrap-transition.js js/bootstrap-alert.js js/bootstrap-button.js js/bootstrap-carousel.js js/bootstrap-collapse.js js/bootstrap-dropdown.js js/bootstrap-modal.js js/bootstrap-tooltip.js js/bootstrap-popover.js js/bootstrap-scrollspy.js js/bootstrap-tab.js js/bootstrap-typeahead.js js/bootstrap-inputmask.js js/bootstrap-rowlink.js js/bootstrap-fileupload.js js/bootstrap-affix.js > bootstrap/js/bootstrap.js
	./node_modules/.bin/uglifyjs -nc bootstrap/js/bootstrap.js > bootstrap/js/bootstrap.min.tmp.js
	echo "/*!\n* Bootstrap.js by @fat & @mdo extended by @ArnoldDaniels\n* Copyright 2012 Twitter, Inc.\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > bootstrap/js/copyright.js
	cat bootstrap/js/copyright.js bootstrap/js/bootstrap.min.tmp.js > bootstrap/js/bootstrap.min.js
	rm bootstrap/js/copyright.js bootstrap/js/bootstrap.min.tmp.js


jasny-bootstrap-js: jasny-bootstrap/js/*.js

jasny-bootstrap/js/*.js: js/*.js
	mkdir -p jasny-bootstrap/js
	cat js/bootstrap-typeahead.js js/bootstrap-inputmask.js js/bootstrap-rowlink.js js/bootstrap-fileupload.js > jasny-bootstrap/js/jasny-bootstrap.js
	./node_modules/.bin/uglifyjs -nc jasny-bootstrap/js/jasny-bootstrap.js > jasny-bootstrap/js/jasny-bootstrap.min.tmp.js
	echo "/*!\n* Jasny-bootstrap.js by @ArnoldDaniels\n* Copyright 2012 Arnold Daniels\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > jasny-bootstrap/js/copyright.js
	cat jasny-bootstrap/js/copyright.js jasny-bootstrap/js/jasny-bootstrap.min.tmp.js > jasny-bootstrap/js/jasny-bootstrap.min.js
	rm jasny-bootstrap/js/copyright.js jasny-bootstrap/js/jasny-bootstrap.min.tmp.js

#
# CSS COMPLILE
#

bootstrap-css: bootstrap/css/*.css

bootstrap/css/*.css: less/*.less
	mkdir -p bootstrap/css
	./node_modules/.bin/recess --compile ${JASNY_BOOTSTRAP_LESS} ${BOOTSTRAP_LESS} > bootstrap/css/bootstrap.css
	./node_modules/.bin/recess --compress ${JASNY_BOOTSTRAP_LESS} ${BOOTSTRAP_LESS} > bootstrap/css/bootstrap.min.css
	./node_modules/.bin/recess --compile ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} ${BOOTSTRAP_RESPONSIVE_LESS} > bootstrap/css/bootstrap-responsive.css
	./node_modules/.bin/recess --compress ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} ${BOOTSTRAP_RESPONSIVE_LESS} > bootstrap/css/bootstrap-responsive.min.css


jasny-bootstrap-css: jasny-bootstrap/css/*.css

jasny-bootstrap/css/*.css: less/*.less
	mkdir -p jasny-bootstrap/css
	./node_modules/.bin/recess --compile ${JASNY_BOOTSTRAP_LESS} > jasny-bootstrap/css/jasny-bootstrap.css
	./node_modules/.bin/recess --compress ${JASNY_BOOTSTRAP_LESS} > jasny-bootstrap/css/jasny-bootstrap.min.css
	./node_modules/.bin/recess --compile ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} > jasny-bootstrap/css/jasny-bootstrap-responsive.css
	./node_modules/.bin/recess --compress ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} > jasny-bootstrap/css/jasny-bootstrap-responsive.min.css
	

#
# IMAGES
#

bootstrap-img: bootstrap/img/*

bootstrap/img/*: img/*
	mkdir -p bootstrap/img
	cp img/* bootstrap/img/


jasny-bootstrap-img: jasny-bootstrap/img/*

jasny-bootstrap/img/*: img/*
	mkdir -p jasny-bootstrap/img
	cp img/* jasny-bootstrap/img/

#
# FONTS
#

bootstrap-font: bootstrap/font/*

bootstrap/font/*: font/*
	mkdir -p jasny-bootstrap/font
	cp font/* jasny-bootstrap/font/


jasny-bootstrap-font: jasny-bootstrap/font/*

jasny-bootstrap/font/*: font/*
	mkdir -p jasny-bootstrap/font
	cp font/* jasny-bootstrap/font/


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


.PHONY: docs watch gh-pages bootstrap-img bootstrap-css bootstrap-js
