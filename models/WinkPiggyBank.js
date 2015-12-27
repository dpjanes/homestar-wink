/*
 *  WinkPiggyBank.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-19
 */

exports.binding = {
    bridge: require('../WinkBridge').Bridge,
    model: require('./WinkPiggyBank.json'),
    matchd: {
        'iot:vendor.type': 'piggy_bank',
    },
};
