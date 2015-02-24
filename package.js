Package.describe({
  summary: "Cordova enabled background geolocation, even when closed/suspended",
  version: "0.0.7",
  name: "zeroasterisk:cordova-geolocation-background",
  git: "https://github.com/zeroasterisk/meteor-cordova-geolocation-background"
});

Cordova.depends({
  // http://plugins.cordova.io/#/package/com.romainstrock.cordova.background-geolocation
  'com.romainstrock.cordova.background-geolocation': '0.3.9',
  'org.apache.cordova.geolocation': '0.3.12',
  'org.apache.cordova.device': '0.2.11'
});


Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2');
  api.use('underscore', 'client');
  api.use('http', 'client');
  api.export('GeolocationBG', 'client');
  api.addFiles('cordova-geolocation-background.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('zeroasterisk:cordova-geolocation-background');
  api.addFiles('cordova-geolocation-background-tests.js', 'client');
});
