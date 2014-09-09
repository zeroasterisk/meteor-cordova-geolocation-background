Tinytest.add('init', function (test) {
  // test: cordova exists
  // test: plugin exists
  // test: plugin methods correct (API expected)
  test.equal(true, true);
  test.isTrue(_.isOject(Geolocation), 'Geolocation object exists');
});

Tinytest.add('foreground get', function (test) {
  // test: location requested in foreground
  test.equal(true, true);
});

Tinytest.add('foreground watch', function (test) {
  // test: location watch in foreground
  test.equal(true, true);
});

