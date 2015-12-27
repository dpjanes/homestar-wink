/*
 *  WinkLight.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-19
 */

exports.binding = {
    bridge: require('../WinkBridge').Bridge,
    model: require('./WinkLight.json'),
    matchd: {
        'iot:vendor.type': 'light_bulb',
    },
};
