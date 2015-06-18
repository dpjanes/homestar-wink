/*
 *  WinkLight.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-19
 */

var iotdb = require("iotdb");

exports.Model = iotdb.make_model('WinkLight')
    .facet(":lighting")
    .name("Wink Light")
    .io("on", iotdb.boolean.on)
    .make();

exports.binding = {
    bridge: require('../WinkBridge').Bridge,
    model: exports.Model,
    matchd: {
        'iot:vendor.type': 'light_bulb',
    },
};
