'use strict';

var mqtt = require('mqtt');

function MQTThook (brokerUrl, options) {
  this._triggers = {};
  this._promise = new Promise((resolve, reject) => {
    this._mqttClient = mqtt.connect(brokerUrl, options);
    this._mqttClient.on('connect', () => { resolve(); });
  });
  this._mqttClient.on('message', (topic, message) => {
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
    this._promise = this._promise.then((mqttTopic) => {
      return new Promise((resolve, reject) => {
        if (typeof callback === 'function') {
          this._triggers[mqttTopic] = this._triggers[mqttTopic] || {};
          this._triggers[mqttTopic].if = callback;
        }
        resolve(mqttTopic);
      });
    });
    return this;
  },

  trigger: function(callback) {
    this._promise = this._promise.then((mqttTopic) => {
      return new Promise((resolve) => {
        if (typeof callback === 'function') {
          this._triggers[mqttTopic] = this._triggers[mqttTopic] || {};
          this._triggers[mqttTopic].trigger = callback;
        }
        resolve();
      });
    });
    return this;
  },
};

module.exports = MQTThook;
