# MQTThook
It is a [MQTT][mqtt] version of [Webhook][webhook] for IoT devices. It helps MQTT-based IoT devices interact with real-world Web applications/services easier and faster with automation services (e.g. [IFTTT][ifttt], [Zapier][zapier], or others).

## Demo
{::nomarkdown}
<iframe src="https://runkit.com/e?name=runkit-embed-0&preamble=&source=var%20MQTThook%20%3D%20require(%27mqtthook%27)%3B%0Avar%20mqtthook%20%3D%20new%20MQTThook(%27mqtt%3A%2F%2Ftest.mosquitto.org%27)%3B%0Amqtthook.hook(%27hooked-topic%27)%0A%20%20.trigger(data%20%3D%3E%20%7B%20console.log(%60PM2.5%3A%20%24%7Bdata.pm2_5%7D%60)%3B%20%7D)%3B&location=https%3A%2F%2Frunkit.com%2Fdocs%2Fembed&readOnly=false&sendResults=false&minHeight=&=&url=%2Fapi%2Fusers%2Fevanxd%2Frepositories%2F58d3718a56cbc800140fb5ad%2Fbranches%2Fmaster"></iframe>
{:/}

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
  .trigger(data => { console.log(`PM2.5: ${data.pm2_5}`); });
```

## Reference
- [MQTT][mqtt] is a machine-to-machine (M2M)/"Internet of Things" connectivity protocol.

[webhook]: https://en.wikipedia.org/wiki/Webhook
[mqtt]: http://mqtt.org
[ifttt]: https://ifttt.com
[zapier]: https://zapier.com
[google-sheets]: https://www.google.com/intl/en/sheets/about/
