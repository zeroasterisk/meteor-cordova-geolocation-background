// Write your package code here!
/**
 * This is an abstraction lib for handling backgrounded processes for GPS updates
 *
 * Source:
 *   https://github.com/christocracy/cordova-plugin-background-geolocation
 *
 * common:
 *   GeolocationBG.avail()
 *     [true/false] is this available?
 *   GeolocationBG.config(options)
 *     getter/setter
 *   GeolocationBG.start()
 *     start background process
 *   GeolocationBG.stop()
 *     stop  background process
 *   GeolocationBG.get()
 *     get the current location (handy shortcut)
 *
 * internal
 *   GeolocationBG.setup()
 *   GeolocationBG.send()
 *     [internal, non-android]
 *   GeolocationBG.sendCallback()
 *     POSTs to the configured URL
 *     submits "data" as JSON content
 */
GeolocationBG = {
  // configure these options via GeolocationBG.config()
  //  - options are passed into the config for Android background process
  //    - https://github.com/christocracy/cordova-plugin-background-geolocation
  //  - options are passed into HTTP.get()
  //    - https://github.com/meteor/meteor/blob/master/packages/http/httpcall_client.js
  options: {
    // your server url to send locations to
    //   YOU MUST SET THIS TO YOUR SERVER'S URL
    //   (see the setup instructions below)
    url: 'http://example.com/api/geolocation',
    params: {
      // will be sent in with 'location' in POST data (root level params)
      // these will be added automatically in setup()
      //userId: GeolocationBG.userId(),
      //uuid:   GeolocationBG.uuid(),
      //device: GeolocationBG.device()
    },
    headers: {
      // will be sent in with 'location' in HTTP Header data
    },
    desiredAccuracy: 10,
    stationaryRadius: 20,
    distanceFilter: 30,
    // Android ONLY, customize the title of the notification
    notificationTitle: 'Background GPS',
    // Android ONLY, customize the text of the notification
    notificationText: 'ENABLED',
    //
    activityType: 'AutomotiveNavigation',
    // enable this hear sounds for background-geolocation life-cycle.
    debug: false
  },

  // placeholders
  bgGeo: null,
  isStarted: false,

  // start background service
  start: function() {
    if (!this.avail()) {
      return false;
    }
    if (!this.isStarted) {
      this.get();
    }
    if (!this.setup()) {
      console.error('GeolocationBG unable to setup, unable to start');
      return false;
    }
    // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
    this.bgGeo.start();
    this.isStarted = true;
    return true;
  },

  // stop background service
  stop: function() {
    if (!this.avail()) {
      return false;
    }
    if (!this.setup()) {
      console.error('GeolocationBG unable to setup, unable to stop');
      return false;
    }
    this.bgGeo.stop()
    return true;
  },

  // is this plugin available? utility
  avail: function() {
    if (!_.isObject(window)) {
      console.error('window does not exist');
      return false;
    }
    if (!_.has(window, 'plugins') || !_.isObject(window.plugins)) {
      console.error('window.plugins does not exist');

// ----------------
// TEMP DEBUGGING
for (var key in window) {
console.log(' window.' + key + ' ~ ' + typeof window[key]);
}
// ----------------

      return false;
    }
    if (!_.has(window.plugins, 'backgroundGeoLocation') || !_.isObject(window.plugins.backgroundGeoLocation)) {
      console.error('window.plugins.backgroundGeoLocation does not exist');
      return false;
    }
    return true;
  },

  /**
   * Configuration getter and setter
   */
  config: function(options) {
    if (_.isString(options)) {
      this.options.url = options;
      return this.options;
    }
    if (!_.isObject(options)) {
      return this.options;
    }
    this.options = _.extend({}, this.options, options);
    return this.options;
  },

  /**
   * Setup the common usage for this plugin
   */
  setup: function() {
    if (!_.isNull(this.bgGeo)) {
      return true;
    }
    if (!this.avail()) {
      console.log('GeolocationBG.setup failed = not avail');
      return false;
    }
    console.log('GeolocationBG: setup: initialize the plugin');
    GeolocationBG.bgGeo = window.plugins.backgroundGeoLocation;

    // update the options with automatic params
    //   params will be sent in with 'location' in POST data (root level params)
    this.options.params.userId = GeolocationBG.userId();
    this.options.params.uuid = GeolocationBG.uuid();
    this.options.params.device = GeolocationBG.device();

    // This callback will be executed every time a geolocation is recorded in the background.
    //   not used for Android
    var callbackFn = function(location) {
      console.log('GeolocationBG: setup: callbackFn: ' + _.values(location).join(','));
      console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
      // Do your HTTP request here to POST location to your server.
      GeolocationBG.send(location);
    };

    // This callback will be executed for error
    //   not used for Android
    var failureFn = function(error) {
      console.log('GeolocationBG: setup: failureFn: ' + _.values(error).join(','));
      console.log('BackgroundGeoLocation error');
    }


    // BackgroundGeoLocation is highly configurable.
    // (NOTE: Android service is automatic)
    GeolocationBG.bgGeo.configure(callbackFn, failureFn, optionsBG);

    console.log('GeolocationBG: setup: end');
    return true;
  },

  /**
   * Send the location via AJAX to GeolocationBG.url
   *
   * @param object location
   */
  send: function(location) {
    console.log('GeolocationBG: send: init');

    if (!_.isObject(location) || !_.has(location, 'longitude')) {
      console.error('GeolocationBG: send: error - location is invalid');
      return;
    }

    var options = _.extend({
      data: {
        longitude: location.longitude,
        latitude: location.latitude,
        userId: GeolocationBG.userId(),
        uuid: GeolocationBG.uuid(),
        device: GeolocationBG.device()
      }
    }, this.options);

    HTTP.call('POST', this.options.url, options, function(res) {
      this.sendCallback(res);
    });
  },

  /**
   * Send the location via AJAX to GeolocationBG.url
   *
   * @param object location
   */
  sendCallback: function(res) {
    console.log('GeolocationBG: send: success: ' + res);
    console.log('[js] BackgroundGeoLocation callback, callback = success' + res);
    //
    // IMPORTANT:  You must execute the #finish method here to inform the native plugin that you're finished,
    //  and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
    // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
    //
    GeolocationBG.bgGeo.finish();
  },

  /**
   * get the userId
   *
   * @param object location
   */
  userId: function() {
    if (!Meteor) {
      return 'noMeteorObj';
    }
    if (!_.has(Meteor, 'userId')) {
      return 'noMeteor.userId';
    }
    if (_.isString(Meteor.userId)) {
      return Meteor.userId;
    }
    return Meteor.userId();
  },

  /**
   * get the device info basics (tie back to user)
   *
   * @param object location
   */
  device: function() {
    device = device || {};
    if (!_.isObject(device)) {
      return 'errDeviceNotObject';
    }
    if (!_.has(device, 'platform')) {
      device.platform = '?';
    }
    if (!_.has(device, 'model')) {
      device.model = '?';
    }
    if (!_.has(device, 'version')) {
      device.version = '?';
    }
    return device.platform + '(' + device.model + ') [' + device.version + ']';
  },

  /**
   * get the device info basics (tie back to user)
   *
   * @param object location
   */
  uuid: function() {
    device = device || {};
    if (!_.isObject(device)) {
      return 'errDeviceNotObject';
    }
    if (!_.has(device, 'uuid')) {
      device.uuid = '?';
    }
    return device.uuid;
  },

  /**
   * Get the current/realtime location (not in BG)
   *
   * Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
   * in order to prompt the user for Location permission.
   */
  get: function() {
    console.log('GeolocationBG: get: init');
    window.navigator.geolocation.getCurrentPosition(function(location) {
      console.log('GeolocationBG: get: got');
      GeolocationBG.send(location);
    });
  }

}
