'use strict';

var mqtt = require('mqtt');
var request = require('request');

function MQTThook (brokerUrl, options = {}) {
  var client = mqtt.connect(brokerUrl, options.connection);
  this._mqttClient = client;
  this._triggers = {};
  this._promise = new Promise(resolve => {
    client.on('connect', () => { resolve(); });
  });
  client.on('message', (topic, message) => {
    var triggers = this._triggers;
    try {
      var data = JSON.parse(message.toString());
      data = typeof data === 'object' ? data : {};
      if (triggers[topic] &&
          ((typeof triggers[topic].if === 'function' && triggers[topic].if(data)) ||
           (triggers[topic].if === undefined)) &&
          typeof triggers[topic].trigger === 'function') {
        triggers[topic].trigger(data);
      }
    } catch (e) {
      console.error(e.message);
    }
  });
}

MQTThook.prototype = {
  _promise: null,
  _mqttClient: null,
  _triggers: null, // { if: function() {}, trigger: function() {} }

  hook: function(mqttTopic) {
    var that = this;
    this._promise = this._promise.then(() => {
      return new Promise(resolve => {
        this._mqttClient.subscribe(mqttTopic);
        resolve(mqttTopic);
      });
    });
    return {
      if: that._if.bind(that),
      trigger: that.trigger.bind(that),
    };
  },

  trigger: function(callback, data) {
    var that = this;
    var triggers = this._triggers;
    this._promise = this._promise.then((mqttTopic) => {
      return new Promise(resolve => {
        if (typeof callback === 'function') {
          if (mqttTopic) {
            triggers[mqttTopic] = triggers[mqttTopic] || {};
            triggers[mqttTopic].trigger = callback;
          } else {
            callback();
          }
        } else if (typeof callback === 'string') {
          // Trigger a Webhook.
          triggers[mqttTopic] = triggers[mqttTopic] || {};
          if (callback.startsWith('https://') || callback.startsWith('http://')) {
            triggers[mqttTopic].trigger = mqttTopic ? triggerWebhook : triggerWebhook(data);
          } else { // Trigger a MQTThook in the same MQTT broker.
            triggers[mqttTopic].trigger = mqttTopic ? triggerMQTThook : triggerMQTThook(data);
          }

          function triggerWebhook(data) {
            request({ url: callback, qs: data }, error => {
              error && console.error(error.message);
            });
          }
          function triggerMQTThook(data) {
            that._mqttClient.publish(callback, JSON.stringify(data), null, error => {
              error && console.error(error.message);
            });
          }
        }
        resolve();
      });
    });
    return {
      hook: that.hook.bind(that),
    };
  },

  _if: function(callback) {
    var that = this;
    var triggers = this._triggers;
    this._promise = this._promise.then((mqttTopic) => {
      return new Promise(resolve => {
        if (typeof callback === 'function') {
          triggers[mqttTopic] = triggers[mqttTopic] || {};
          triggers[mqttTopic].if = callback;
        }
        resolve(mqttTopic);
      });
    });
    return {
      trigger: that.trigger.bind(that),
    };
  },
};

module.exports = MQTThook;
