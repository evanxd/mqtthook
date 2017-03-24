# MQTThook
It is a [MQTT][mqtt] version of [Webhook][webhook] for IoT devices. It helps MQTT-based IoT devices interact with real-world Web applications/services easier and faster with automation services (e.g. [IFTTT][ifttt], [Zapier][zapier], or others).

## Try It
Go to the [RunKit page][mqtthook-example] to setup an example MQTThook and use the [Websocket-based MQTT client][mqtt-client] or build a real [air quality monitoring station][air-quality-monitoring-station] to trigger it.
![Demo](./images/demo.gif)

The code of the MQTThook example:
```js
var MQTThook = require('mqtthook');
var mqtthook = new MQTThook('mqtt://test.mosquitto.org');
mqtthook.hook('hooked-topic')
  .trigger(data => { console.log(`PM2.5: ${data.pm2_5} μg/m3`); });
```

You can send a JSON data with the format `{ "pm2_5": 17 }` to the `hooked-topic` topic on the `mqtt://test.mosquitto.org` broker to trigger the MQTThook. The [RunKit page][mqtthook-example] will show the PM2.5 value you send to.

## How-to
Initialize a MQTThook instance.
```js
var MQTThook = require('mqtthook');
var mqtthook = new MQTThook('mqtt://test.mosquitto.org');
```

Trigger a callback `function` to print the PM2.5 data on the console when a hooked MQTT topic received the data.
```js
mqtthook.hook('hooked-topic')
  .if(data => { return data.pm2_5 > 70 })
  .trigger(data => { console.log(`PM2.5: ${data.pm2_5} μg/m3`); });
```

Trigger a [WebHook][webhook] which will store the data in a [Google Sheets][google-sheets] sheet when a hooked MQTT topic received PM2.5 data.
```js
mqtthook.hook('hooked-topic')
  .trigger((data) => {
    mqtthook.trigger('https://webhook.fake/hooks/3345678', { pm2_5: data.pm2_5 });
  });
```

Trigger a MQTThook which will forward PM2.5 data to another MQTT topic when a hooked MQTT topic received the PM2.5 data.
```js
mqtthook.hook('hooked-topic')
  .trigger((data) => {
    mqtthook.trigger('triggered-topic', { pm2_5: data.pm2_5 });
  });
```

## Reference
- [MQTT][mqtt] is a machine-to-machine (M2M)/"Internet of Things" connectivity protocol.
- [Webhook][webhook] in web development is a method of augmenting or altering the behavior of a web page, or web application, with custom callbacks.

[webhook]: https://en.wikipedia.org/wiki/Webhook
[mqtt]: http://mqtt.org
[ifttt]: https://ifttt.com
[zapier]: https://zapier.com
[google-sheets]: https://www.google.com/intl/en/sheets/about/
[mqtthook-example]: https://goo.gl/abgsTZ
[mqtt-client]: http://www.hivemq.com/demos/websocket-client
[air-quality-monitoring-station]: https://github.com/evanxd/air-quality-monitoring-station
