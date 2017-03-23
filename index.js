'use strict';

var mqtt = require('mqtt');

function MQTThook (brokerUrl, options) {
  var client = mqtt.connect(brokerUrl, options);
  this._mqttClient = client;
  this._triggers = {};
  this._promise = new Promise((resolve, reject) => {
    client.on('connect', () => { resolve(); });
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
    var that = this;
    this._promise = this._promise.then(() => {
      return new Promise((resolve) => {
        this._mqttClient.subscribe(mqttTopic);
        resolve(mqttTopic);
      });
    });
    return {
      if: that._if.bind(that),
      trigger: that.trigger.bind(that),
    };
  },

  trigger: function(callback) {
    var triggers = this._triggers;
    this._promise = this._promise.then((mqttTopic) => {
      return new Promise((resolve) => {
        if (typeof callback === 'function') {
          if (mqttTopic) {
            triggers[mqttTopic] = triggers[mqttTopic] || {};
            triggers[mqttTopic].trigger = callback;
          } else {
            callback();
          }
        }
        resolve();
      });
    });
  },

  _if: function(callback) {
    var that = this;
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
    return {
      trigger: that.trigger.bind(that),
    };
  },
};

module.exports = MQTThook;
