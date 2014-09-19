Tinytest.add('background-init', function (test) {
  // test: cordova exists
  // test: plugin exists
  // test: plugin methods correct (API expected)
  test.equal(true, true);
  test.equal(typeof GeolocationBG, 'object', 'We do not have GeolocationBG defined');
  test.equal(GeolocationBG.hasWorked, false, 'GeolocationBG shows that is has worked in the past... but should not have yet');
  //test.assertTrue(GeolocationBG);
  //test.assertTrue(_.isOjbect(GeolocationBG));
});

if (Meteor.isCordova) {
  Tinytest.add('background-avail', function (test) {
    // test: plugin available
    test.equal(GeolocationBG.avail(), true, 'GeolocationBG.avail() is false');
  });
  Tinytest.add('background-config', function (test) {
    // test: plugin available
    var config = GeolocationBG.config();
    test.equal(_.isObject(config), true, 'GeolocationBG.config() should return the default configuration');
    var after = GeolocationBG.config({
      url: 'http://example.com/foobar',
      newProp: 'foobar'
    });
    var expect = config;
    expect.url = 'http://example.com/foobar';
    expect.newProp = 'foobar';
    test.equal(after, expect, 'GeolocationBG.config() should setup the after copy of the config, with the expected changes');
  });
  Tinytest.add('background-start', function (test) {
    test.equal(GeolocationBG.start(), true, 'GeolocationBG.start() is false');
  });
  Tinytest.add('background-stop', function (test) {
    test.equal(GeolocationBG.stop(), true, 'GeolocationBG.stop() is false');
  });
  Tinytest.add('background-setup', function (test) {
    test.equal(GeolocationBG.setup(), true, 'GeolocationBG.setup() is false');
  });
  Tinytest.add('background-send', function (test) {
    //test.equal(GeolocationBG.send(location), true, 'GeolocationBG.send() is false');
  });
  Tinytest.add('background-sendCallback', function (test) {
    //test.equal(GeolocationBG.sendCallback(response), true, 'GeolocationBG.sendCallback() is false');
  });
  // -----------
  // todo
  // -----------
  Tinytest.add('background-android', function (test) {
    // test: location requested in background - android
    test.equal(true, true);
  });
  Tinytest.add('background-ios', function (test) {
    // test: location requested in background - ios
    test.equal(true, true);
  });

}
