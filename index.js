/*
 *  index.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-19
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

exports.Bridge = require('./WinkBridge');
exports.bindings = [
    require('./models/WinkAirConditioner').binding,
    require('./models/WinkCloudClock').binding,
    require('./models/WinkEggTray').binding,
    require('./models/WinkHub').binding,
    require('./models/WinkLight').binding,
    require('./models/WinkPiggyBank').binding,
    require('./models/WinkPowerStrip').binding,
    require('./models/WinkPropaneTank').binding,
    require('./models/WinkRemote').binding,
    require('./models/WinkSensorPod').binding,
];

exports.iotdb = require("iotdb");
exports.wrap = function(name, initd) {
    return exports.iotdb.make_wrap(name, exports.bindings, initd);
};
