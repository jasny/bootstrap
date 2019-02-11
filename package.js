// package metadata file for Meteor.js

Package.describe({
  name: 'jasny:bootstrap',  // http://atmospherejs.com/jasny/bootstrap
  version: '4.0.0',
  summary: 'Jasny Bootstrap (official): The missing components for your favorite front-end framework.',
  git: 'https://github.com/jasny/bootstrap.git',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');

  api.use('jquery', 'client');

  api.addFiles([
    'dist/css/jasny-bootstrap.css',
    'dist/js/jasny-bootstrap.js'
  ], 'client');
});
