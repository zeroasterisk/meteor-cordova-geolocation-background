# Meteor + Cordova get Geolocation in Background

This is a Meteor Smart Package which installs the
[Cordova Background GeoLocation Plugin](http://plugins.cordova.io/#/package/com.romainstrock.cordova.background-geolocation)
[GitHub](https://github.com/christocracy/cordova-plugin-background-geolocation),
and exposes a simpler API to setup, configure, and start/stop the background
service.

See an [example application using it here](https://github.com/zeroasterisk/meteor-cordova-geolocation-example).

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
meteor add zeroasterisk:cordova-geolocation-background
```


## Location Data / fields

* longitude
* latitude
* speed
* accuracy
* uuid (of the device, if available)
* userId (of the `Meteor.userId`, if available)
* key (simple `Meteor.identity` key to act as a simple security measure)

## Setup Cordova Android

Should be automatic if you configure the Plugin

## Setup Cordova iOS

Should be automatic if you configure the Plugin

## Setup This Plugin (isCordova on the client)

Here is the "default" config with some notes to help.

Pass in only what you need to overwrite...

You *must set* the `url` options.

```
if (Meteor.isCordova) {
  GeolocationBG.config({
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
  });
}
```

No `params` or `headers` are required, but you can add whatever you like...
which you can use on the server as validation, or as extra data to log/use.

## Setup a Receiver on the Meteor Server

You can do this any way you like, but if you're using IronRouter you can
implement as described below.

Note, I use the `zeroasterisk:throttle` package to limit the possible
"flooding" of the path to 100 requests every second (scale as needed).

You can test this with curl, you don't even have to fire up Cordova.

```
curl -v -H "Content-Type: application/json" -X PUT --data '{"device":"curl","location":{"longitude":"-85.70906639098872","recorded_at":"Thu Sep 25 01:07:35 EDT 2014","latitude":"38.258042335509145","speed":"0.0","accuracy":"181.94342"},"uuid":"curl","userId":null}' 'http://localhost:3000/api/geoloaction'
```


## Setup IronRouter to Receive POSTed data (isServer)

You can "receive" the POSTed data however you like, but I recommend via
server-side routes on IronRouter.

* [instructions](http://www.meteorpedia.com/read/REST_API#iron-router server-side routes)
* [rest-api](https://github.com/awatson1978/rest-api)

```
Router.map(function() {
  // REST(ish) API
  // Cordova background/foreground can post GPS data HERE
  //
  // POST data should be in this format
  //   {
  //     location: {
  //       latitude: Number,
  //       longitude: Number,
  //       accuracy: Match.Optional(Number),
  //       speed: Match.Optional(Number),
  //       recorded_at: Match.Optional(String)
  //     },
  //     userId: Match.Optional(String),
  //     uuid: Match.Optional(String),
  //     device: Match.Optional(String)
  //   }
  this.route('GeolocationBGRoute', {
    path: 'api/geolocation',
    where: 'server',
    action: function() {
      // GET, POST, PUT, DELETE
      var requestMethod = this.request.method;
      // Data from a POST request
      var requestData = this.request.body;

      // log stuff
      //console.log('GeolocationBG post: ' + requestMethod);
      //console.log(JSON.stringify(requestData));

      // TODO: security/validation
      //  require some security with data
      //  validate userId/uuid/etc (inside Meteor.call?)

      // Can insert into a Collection from the server (or whatever)
      if (GeolocationLog.insert(requestData)) {
        this.response.writeHead(200, {'Content-Type': 'application/json'});
        this.response.end('ok');
        return;
      }

      // if we end up with an error case, you can return 500
      this.response.writeHead(500, {'Content-Type': 'application/json'});
      this.response.end('failure');
    }
  });
});
```

## Start / Stop the Background Service (isCordova on the client)

```
GeolocationBG.start();
GeolocationBG.stop();
```

## Get Geolocation "now" in the Foreground

This is actually a part the [Cordova Geolocation Plugin](http://plugins.cordova.io/#/package/org.apache.cordova.geolocation).

Cordova has a simple API for getting the current location or watching it,
either way calling a success function with the location data... you can use
their code examples if you want.

You may also use the
[mdg:geolocation](https://github.com/meteor/mobile-packages/tree/master/packages/mdg:geolocation)
package, which is really thin and simple, but seems to be effective.

You may also use the
[zeroasterisk:geolocation-foreground](https://github.com/zeroasterisk/meteor-cordova-geolocation-foreground)
package, which is an approach at Geolocation more close to the original Cordova examples.




