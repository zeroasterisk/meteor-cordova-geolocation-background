Tinytest.add('init', function (test) {
  // test: cordova exists
  // test: plugin exists
  // test: plugin methods correct (API expected)
  test.equal(true, true);
});

Tinytest.add('foreground', function (test) {
  // test: location requested in foreground
  test.equal(true, true);
});

Tinytest.add('background-android', function (test) {
  // test: location requested in background - android
  test.equal(true, true);
});

Tinytest.add('background-ios', function (test) {
  // test: location requested in background - ios
  test.equal(true, true);
});


