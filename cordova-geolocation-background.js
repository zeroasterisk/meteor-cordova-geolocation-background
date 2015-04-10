// Write your package code here!
/**
 * This is an abstraction lib for handling backgrounded processes for GPS updates
 *
 * Source:
 *   https://github.com/christocracy/cordova-plugin-background-geolocation
 *
 * common:
 *   GeolocationBG.setup()
 *     [true/false] is this available and setup?
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
 *   GeolocationBG.sendCallbackSuccess()
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
  fgGeo: null,
  isStarted: false,

  // start background service
  start: function() {
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
    if (!this.setup()) {
      console.error('GeolocationBG unable to setup, unable to stop');
      return false;
    }
    this.bgGeo.stop()
    this.isStarted = false;
    return true;
  },

  // where is this plugin available?
  //   get it whereever we can find it, and assign it to this.bgGeo
  getPlugin: function() {
    if (_.isObject(this.bgGeo)) {
      return this.bgGeo;
    }
    console.log('backgroundGeoLocation ~ ' + typeof backgroundGeoLocation);
    if (typeof backgroundGeoLocation == "object") {
      this.bgGeo = backgroundGeoLocation || null;
      if (_.isObject(this.bgGeo)) {
        return this.bgGeo;
      }
    }
    console.log('window.backgroundGeoLocation ~ ' + typeof window.backgroundGeoLocation);
    if (typeof window.backgroundGeoLocation == "object") {
      this.bgGeo = window.backgroundGeoLocation || null;
      if (_.isObject(this.bgGeo)) {
        return this.bgGeo;
      }
    }
    if (typeof window.plugins == "object") {
      console.log('window.plugins.backgroundGeoLocation ~ ' + typeof window.plugins.backgroundGeoLocation);
      if (typeof window.plugins.backgroundGeoLocation == "object") {
        this.bgGeo = window.plugins.backgroundGeoLocation || null;
        if (_.isObject(this.bgGeo)) {
          return this.bgGeo;
        }
      }
    }
    if (typeof cordova != "object") {
      console.error('No cordova object in global scope');
      return false;
    }
    console.log('cordova.backgroundGeoLocation ~ ' + typeof cordova.backgroundGeoLocation);
    if (typeof cordova.backgroundGeoLocation == "object") {
      this.bgGeo = cordova.backgroundGeoLocation || null;
      if (_.isObject(this.bgGeo)) {
        return this.bgGeo;
      }
    }
    if (typeof cordova.plugins == "object") {
      console.log('cordova.plugins.backgroundGeoLocation ~ ' + typeof cordova.plugins.backgroundGeoLocation);
      if (typeof cordova.plugins.backgroundGeoLocation == "object") {
        this.bgGeo = cordova.plugins.backgroundGeoLocation || null;
        if (_.isObject(this.bgGeo)) {
          return this.bgGeo;
        }
      }
    }
for (var key in window) {
  console.log('  window.' + key + ' ~ ' + typeof window[key]);
}
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
   *
   * - this.options.params setup for iOS & Android
   * - callbacks setup for iOS (not Android)
   *
   * This setup should be run AFTER the device information is available
   * and it should be run AFTER the Meteor.userId() information is available
   * (because it can not be re-run in the background, at the time of location updates)
   *
   */
  setup: function() {
    if (!_.isNull(this.bgGeo)) {
      return true;
    }
    this.getPlugin();
    if (!_.isObject(this.bgGeo)) {
      console.log('GeolocationBG.setup failed = not avail');
      return false;
    }

    // update the options with automatic params
    //   params will be sent in with 'location' in POST data (root level params)
    //
    //   NOTE we setup the params now, but their values may change...
    //   if they change, we should re-setup the params

    // !!!! IDEA TO BE TESTED !!!!
    // This should update these values when any of them change
    Tracker.autorun(function(c) {
      this.options.params.device = GeolocationBG.device();
      this.options.params.userId = GeolocationBG.userId();
      this.options.params.uuid = GeolocationBG.uuid();
    }.bind(this));


    // This callback will be executed every time a geolocation is recorded in the background.
    //   not used for Android <<
    var callbackFn = function(location) {
      console.log('GeolocationBG: setup: callbackFn: ' + _.values(location).join(','));
      console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
      // Do your HTTP request here to POST location to your server.
      GeolocationBG.send(location);
    };

    // This callback will be executed for error
    //   not used for Android <<
    var failureFn = function(error) {
      console.log('GeolocationBG: setup: failureFn: ' + _.values(error).join(','));
      console.log('BackgroundGeoLocation error');
    }


    // BackgroundGeoLocation is highly configurable.
    // (NOTE: Android service is automatic)
    GeolocationBG.bgGeo.configure(callbackFn, failureFn, this.options);

    console.log('GeolocationBG: setup: end');
    return true;
  },

  /**
   * Send the location via AJAX to GeolocationBG.url
	 *
   * - this is our callbacks for iOS (not Android)
	 * - this relies on data, configured in this.options (see setup())
   *
   * @param object location
   */
  send: function(location) {
    console.log('GeolocationBG: send location: ' + JSON.stringify(location));

    if (!_.isObject(location)) {
      console.error('GeolocationBG: send: error - location is invalid - not an object');
      return;
    }
    if (_.has(location, 'location')) {
      location = location.location;
    }
    if (_.has(location, 'coords')) {
      location = location.coords;
    }
    if (!_.has(location, 'longitude')) {
      console.error('GeolocationBG: send: error - location is invalid - no coords');
      return;
    }

    // put all of the location object into our data
    //   this has the longitude and latitude
    var data = location;

    // if we ran setup() then we already have userId, uuid, and device
    if (_.has(this.options, 'params') && _.isObject(this.options.params)) {
      data = _.extend(data, this.options.params);
    } else {
      // we can try to get the info now, but it's unlikely to work if we are backgrounded
      data.userId = GeolocationBG.userId();
      data.uuid = GeolocationBG.uuid();
      data.device = GeolocationBG.device();
    }
    // add in all our configured options
    var options = _.extend({data: data}, this.options);

    console.log('GeolocationBG: send url: ' + this.options.url);
    console.log('GeolocationBG: send options: ' + JSON.stringify(options));
    HTTP.call('POST', this.options.url, options, function(err, res) {
      if (err) {
        console.error('HTTP.call() callback error');
        console.error(JSON.stringify(err));
        console.log(JSON.stringify(res));
        return;
      }
      console.log('[debugging] HTTP.call() callback');
      //console.log(JSON.stringify(err));
      //console.log(JSON.stringify(res));
      GeolocationBG.sendCallbackSuccess(res);
    });
  },

  /**
   * Send the location via AJAX to GeolocationBG.url
   *
   * @param object location
   */
  sendCallbackSuccess: function(res) {
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
    try {
      return Meteor.userId();
    } catch (e) {
      return '?';
    }
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
   * Get the navigator.geolocation plugin (foreground)
   *
   */
  getPluginFG: function() {
    if (_.isObject(this.fgGeo)) {
      return this.fgGeo;
    }
    this.fgGeo = window.navigator.geolocation || null;
    if (_.isObject(this.fgGeo)) {
      return this.fgGeo;
    }
    this.fgGeo = navigator.geolocation || null;
    if (_.isObject(this.fgGeo)) {
      return this.fgGeo;
    }
    this.fgGeo = geolocation || null;
    if (_.isObject(this.fgGeo)) {
      return this.fgGeo;
    }
    console.error('navigator.geolocation does not exist');
  },

  /**
   * Get the current/realtime location (not in BG)
   *
   * Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
   * in order to prompt the user for Location permission.
   */
  get: function() {
    console.log('GeolocationBG: get: init');
    this.getPluginFG();
    if (!_.isObject(this.fgGeo)) {
      console.error('GeolocationBG: get: failure... navigator.geolocation not available');
      return;
    }
    this.fgGeo.getCurrentPosition(function(location) {
      console.log('GeolocationBG: get: got');
      GeolocationBG.send(location);
    });
  }

}
