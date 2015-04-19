/*
 *  WinkDimmerLight.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-19
 */

var iotdb = require("iotdb");

exports.Model = iotdb.make_model('WinkDimmerLight')
    .facet(":lighting")
    .name("Wink Dimmer Light")
    .io("on", iotdb.boolean.on)
    .make();

exports.binding = {
    bridge: require('../WinkBridge').Bridge,
    model: exports.Model,
    matchd: {
        'iot:vendor/type': 'light_bulb',
    },
};
