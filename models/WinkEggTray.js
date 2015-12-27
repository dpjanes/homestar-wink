/*
 *  WinkEggTray.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-19
 */

exports.binding = {
    bridge: require('../WinkBridge').Bridge,
    model: require('./WinkEggTray.json'),
    matchd: {
        'iot:vendor.type': 'eggtray',
    },
};
