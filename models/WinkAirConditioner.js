/*
 *  WinkAirConditioner.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-19
 */

exports.binding = {
    bridge: require('../WinkBridge').Bridge,
    model: require('./WinkAirConditioner.json'),
    matchd: {
        'iot:vendor.type': 'air_conditioner',
    },
};
