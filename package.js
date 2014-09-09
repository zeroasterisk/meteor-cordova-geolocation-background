Package.describe({
  summary: "Cordova enabled background geolocation, so your Meteor Cordova app can update location even when closed/suspended",
  version: "0.1.0",
  name: "zeroasterisk:meteor-cordova-geolocation-background",
  git: "https://github.com/zeroasterisk/meteor-cordova-geolocation-background"
});

Cordova.depends({
  // http://plugins.cordova.io/#/package/com.romainstrock.cordova.background-geolocation
  'com.romainstrock.cordova.background-geolocation': '0.3.9',
  'org.apache.cordova.geolocation': '0.3.9'
});


Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2-rc1');
  api.addFiles('cordova-geolocation.js', 'client');
  api.addFiles('cordova-geolocation-background.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('cordova-geolocation-background');
  api.addFiles('cordova-geolocation-tests.js', 'client');
  api.addFiles('cordova-geolocation-background-tests.js', 'client');
});
