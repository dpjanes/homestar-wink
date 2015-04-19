/*
 *  WinkSensorPod.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-19
 */

var iotdb = require("iotdb");

exports.Model = iotdb.make_model('WinkSensorPod')
    .name("Wink Sensor Pod")
    .make();

exports.binding = {
    bridge: require('../WinkBridge').Bridge,
    model: exports.Model,
    matchd: {
        'iot:vendor/type': 'sensor_pod',
    },
};
