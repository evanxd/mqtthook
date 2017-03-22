# MQTThook
It is a [MQTT][mqtt] version of [Webhook][webhook] for IoT devices. It helps MQTT-based IoT devices interact with real-world Web applications/services easier and faster with automation services (e.g. [IFTTT][ifttt], [Zapier][zapier], or others).

## Sample Code
Initialize a MQTThook instance.
```js
var MQTThook = require('mqtthook');
var mqtthook = new MQTThook('mqtt://test.mosquitto.org');
```

Trigger a [WebHook][webhook] which will store the data in a [Google Sheets][google-sheets] sheet when a hooked MQTT topic received the PM2.5 data.
```js
mqtthook.hook('hooked-topic')
  .if(function(data) { return data.pm2_5 > 70 })
  .trigger('https://webhook.fake/hooks/3345678', { pm2_5: 'pm2_5' });
```

Trigger a `function` to print the PM2.5 data on the console when a hooked MQTT topic received the data.
```js
mqtthook.hook('hooked-topic')
  .trigger((data) => { console.log(`PM2.5: ${data.pm2_5}`); });
```

## Reference
- [MQTT][mqtt] is a machine-to-machine (M2M)/"Internet of Things" connectivity protocol.

[webhook]: https://en.wikipedia.org/wiki/Webhook
[mqtt]: http://mqtt.org
[ifttt]: https://ifttt.com
[zapier]: https://zapier.com
[google-sheets]: https://www.google.com/intl/en/sheets/about/
