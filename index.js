'use strict';

var MQTThook = require('./mqtthook');
var mqtthook = new MQTThook('mqtt://test.mosquitto.org');

mqtthook.hook('hooked-topic')
  .if(data => { return data.pm2_5 > 70 })
  .trigger(() => {
    console.log('PM2.5 is very high!');
  });
