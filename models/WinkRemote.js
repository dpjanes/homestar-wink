/*
 *  WinkRemote.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-19
 */

var iotdb = require("iotdb");

exports.Model = iotdb.make_model('WinkRemote')
    .facet(":control")
    .name("Wink Remote")
    .make();

exports.binding = {
    bridge: require('../WinkBridge').Bridge,
    model: exports.Model,
    matchd: {
        'iot:vendor.type': 'remote',
    },
};
