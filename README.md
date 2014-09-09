# Meteor + Cordova get Geolocation in Background

This is a Meteor Smart Package which installs the
[Cordova Background GeoLocation Plugin](http://plugins.cordova.io/#/package/com.romainstrock.cordova.background-geolocation)
[GitHub](https://github.com/christocracy/cordova-plugin-background-geolocation),
and exposes a simpler API to setup, configure, and start/stop the background
service.

## How it Works

1. Meteor build Cordova with this Plugin
2. Meteor configures this Plugin in Cordova (you have to configure)
3. Meteor can trigger the Background service to get Geolocation (GPS) details
4. The Cordova Background service periodically POSTs it's data to the Meteor server (not to the client Cordova instance)
5. Meteor Server can update a Collection (or anything else)
6. Meteor Client syncs with the server

## Install

requires Meteor 0.9.2+

```
meteor add zeroasterisk:meteor-cordova-geolocation-background
```


## Location Data / fields

* longitude
* latitude
* speed
* accuracy
* uuid (of the device, if available)
* userId (of the `Meteor.userId`, if available)
* key (simple `Meteor.identity` key to act as a simple security measure)

## Setup a Receiever on the Meteor Server

You can do this any way you like, but if you're using IronRouter you can
implement as follows:

```
....
```

That example will listen on the path `/api/geoloaction` and then "validate" the
reponse.

If valid, it will then update the `User.location` to the current location.

It will also log the location in `UserLocations` which may be useful to have
a historical log of past locations (though beware of blowing up your database).

Note, I use the `zeroasterisk:throttle` package to limit the possible
"flooding" of the path to 100 requests every second (scale as needed).

You can test this with curl, you don't even have to fire up Cordova.

```
curl -v -H "Content-Type: application/json" -X PUT --data '{"longitude":123.333,"latitude":123.555,"uuid":"curl","userId":"curltest1","key":"test"}' 'http://localhost:3000/api/geoloaction'
```

## Setup Cordova Android


## Setup Cordova iOS

...

## Start / Stop the Background Service

...

## Get Geolocation "now" in the Foreground

This is actually a part the [Cordova Geolocation Plugin](http://plugins.cordova.io/#/package/org.apache.cordova.geolocation).

Cordova has a simple API for getting the current location or watching it,
either way calling a success function with the location data:

```
navigator.geolocation.getCurrentPosition(geolocationSuccess,
		[geolocationError],
		[geolocationOptions]);

// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
var onSuccess = function(position) {
    alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
};

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);

var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

navigator.geolocation.clearWatch(watchID)
```

I have exposed a Meteor-ish convenient wrapper for this.

```
Geolocation.get(function(position) {
}, geolocationOptions);

var watchID = Geolocation.watch(function(position) {
}, 30000, geolocationOptions);

Geolocation.clearWatch(watchID);
```


