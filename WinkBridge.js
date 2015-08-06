/*
 *  WinkBridge.js
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

var iotdb = require('iotdb');
var _ = iotdb._;
var bunyan = iotdb.bunyan;

var WinkAPI = require('node-winkapi');

var logger = bunyan.createLogger({
    name: 'homestar-wink',
    module: 'WinkBridge',
});

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var WinkBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/WinkBridge/initd"), {
            poll: 30
        }
    );
    self.native = native; // the thing that does the work - keep this name

    if (self.native) {
        self.queue = _.queue("WinkBridge");
    }
};

WinkBridge.prototype = new iotdb.Bridge();

WinkBridge.prototype.name = function () {
    return "WinkBridge";
};

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
WinkBridge.prototype.discover = function () {
    var self = this;

    logger.info({
        method: "discover"
    }, "called");

    /*
     *  This is the core bit of discovery. As you find new
     *  things, make a new WinkBridge and call 'discovered'.
     *  The first argument should be self.initd, the second
     *  the thing that you do work with
     */
    var cfgd = iotdb.keystore().get("bridges/WinkBridge");
    if (!cfgd) {
        logger.error({
            method: "discover",
        }, "WinkBridge is not configured");
        return;
    }

    var wink_api = new WinkAPI.WinkAPI({
        clientID: cfgd.client_id,
        clientSecret: cfgd.client_secret,
    });
    wink_api.login(cfgd.username, cfgd.password, function (error) {
        if (error) {
            logger.error({
                method: "discover/login",
                error: error,
            }, "WinkBridge could not login");
            return;
        }

        wink_api.getDevices(function (error, devices) {
            if (error) {
                logger.error({
                    method: "discover/login/getDevices",
                    error: error,
                }, "WinkBridge could not getDevices");
                return;
            }

            for (var di in devices) {
                self.discovered(new WinkBridge(self.initd, devices[di]));
            }
        });

    });
};

/**
 *  See {iotdb.bridge.Bridge#connect} for documentation.
 */
WinkBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._validate_connect(connectd);

    self._setup_polling();
    self.pull();
};

WinkBridge.prototype._setup_polling = function () {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

WinkBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#disconnect} for documentation.
 */
WinkBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#push} for documentation.
 */
WinkBridge.prototype.push = function (pushd, done) {
    var self = this;
    if (!self.native) {
        done(new Error("not connected"));
        return;
    }

    self._validate_push(pushd);

    logger.info({
        method: "push",
        pushd: pushd,
    }, "push");

    var qitem = {
        // if you set "id", new pushes will unqueue old pushes with the same id
        // id: self.number, 
        run: function () {
            self._pushd(pushd);
            self.queue.finished(qitem);
            done();
        }
    };
    self.queue.add(qitem);
};

/**
 *  Do the work of pushing. If you don't need queueing
 *  consider just moving this up into push
 */
WinkBridge.prototype._push = function (pushd) {
    if (pushd.on !== undefined) {}
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
WinkBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }
};

/* --- state --- */

/**
 *  See {iotdb.bridge.Bridge#meta} for documentation.
 */
WinkBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing-id": _.id.thing_urn.unique("Wink", "hub-" + self.native.props.hub_id, "id-" + self.native.id),
        "schema:name": self.native.name || "Wink",

        // other possibilites
        // "iot:thing": _.id.thing_urn.unique("Wink", self.native.uuid, self.initd.number),
        // "iot:number": self.initd.number,
        // "iot:device-id": _.id.thing_urn.unique("Wink", self.native.uuid),
        "schema:manufacturer": self.native.props.device_manufacturer,
        'iot:vendor.type': self.native.type,
        'iot:vendor.model': self.native.props.model_name,
    };

};

/**
 *  See {iotdb.bridge.Bridge#reachable} for documentation.
 */
WinkBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#configure} for documentation.
 */
WinkBridge.prototype.configure = function (app) {};

/* -- internals -- */

/*
 *  API
 */
exports.Bridge = WinkBridge;
