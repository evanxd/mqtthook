'use strict';

var mqtt = require('mqtt');

function MQTThook (brokerUrl, options) {
  this._triggers = {};
  var client;
  this._promise = new Promise((resolve, reject) => {
    client = mqtt.connect(brokerUrl, options);
    client.on('connect', () => { resolve(); });
    this._mqttClient = client;
  });
  client.on('message', (topic, message) => {
    var triggers = this._triggers;
    try {
      var data = JSON.parse(message.toString());
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
    this._promise = this._promise.then(() => {
      return new Promise((resolve) => {
        this._mqttClient.subscribe(mqttTopic);
        resolve(mqttTopic);
      });
    });
    return this;
  },

  if: function(callback) {
    var triggers = this._triggers;
    this._promise = this._promise.then((mqttTopic) => {
      return new Promise((resolve, reject) => {
        if (typeof callback === 'function') {
          triggers[mqttTopic] = triggers[mqttTopic] || {};
          triggers[mqttTopic].if = callback;
        }
        resolve(mqttTopic);
      });
    });
    return this;
  },

  trigger: function(callback) {
    var triggers = this._triggers;
    this._promise = this._promise.then((mqttTopic) => {
      return new Promise((resolve) => {
        if (typeof callback === 'function') {
          triggers[mqttTopic] = triggers[mqttTopic] || {};
          triggers[mqttTopic].trigger = callback;
        }
        resolve();
      });
    });
    return this;
  },
};

module.exports = MQTThook;
