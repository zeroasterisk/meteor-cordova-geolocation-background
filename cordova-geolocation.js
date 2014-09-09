/**
 * Geolocation API for foreground actions
 *
 * basically a wrapper for
 * http://plugins.cordova.io/#/package/org.apache.cordova.geolocation
 *
 * - get()
 * - watch()
 * - clearWatch()
 */
Geolocation = Geolocation || {};

/**
 * Default options
 */
Geolocation.options = Geolocation.options || {
  maximumAge: 3000,
  timeout: 5000,
  enableHighAccuracy: true
};

/**
 * Global and generic onError handler for foreground actions
 *
 * @param object error
 * @return void
 */
Geolocation.onError = function(error) {
  if (!_.isObject(error)) {
    throw new Meteor.Error(500, 'Geolocation error' . error);
    return;
  }
  throw new Meteor.Error(500, 'Geolocation error [' + error.code + '] ' + error.message);
};

/**
 * Get the current Geolocation now, in the foreground
 *
 * @param function onSuccess
 * @param object options
 * @return boolean
 */
Geolocation.get = function(onSuccess, options) {
  if (!_.isFunction(onSuccess)) {
    throw new Meteor.Error(500, 'Geolocation.get onSuccess is not a function');
  }
  if (!_.isObject(options)) {
    options = Geolocation.options;
  }
  return navigator.geolocation.getCurrentPosition(onSuccess, Geolocation.onError, options);
};

/**
 * Start a foreground "watch" for Geolocation
 *
 * @param function onSuccess
 * @param int timeout
 * @param object options
 * @return string watchId
 */
Geolocation.watch = function(onSuccess, timeout, options) {
  if (!_.isFunction(onSuccess)) {
    throw new Meteor.Error(500, 'Geolocation.watch onSuccess is not a function');
  }
  if (!_.isInt(timeout)) {
    timeout = 30000;
  }
  if (!_.isObject(options)) {
    options = Geolocation.options;
  }
  options.timeout = timeout;
  return navigator.geolocation.watchPosition(onSuccess, Geolocation.onError, options);
};

/**
 * Clear a foreground "watch" for Geolocation
 *
 * @param string watchId
 * @return void
 */
Geolocation.clearWatch = function(watchId) {
  if (!_.isString(watchId)) {
    throw new Meteor.Error(500, 'Geolocation.clearWatch watchId is not a string');
  }
  return navigator.geolocation.clearWatch(watchId);
};

