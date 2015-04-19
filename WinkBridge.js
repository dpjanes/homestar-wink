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
 *  EXEMPLAR and INSTANCE
 *  <p>
 *  No subclassing needed! The following functions are
 *  injected _after_ this is created, and before .discover and .connect
 *  <ul>
 *  <li><code>discovered</code> - tell IOTDB that we're talking to a new Thing
 *  <li><code>pulled</code> - got new data
 *  <li><code>connected</code> - this is connected to a Thing
 *  <li><code>disconnnected</code> - this has been disconnected from a Thing
 *  </ul>
 */
var WinkBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/WinkBridge/initd"), {
            poll: 30
        }
    );
    self.native = native;   // the thing that does the work - keep this name

    if (self.native) {
        self.queue = _.queue("WinkBridge");
    }
};

/* --- lifecycle --- */

/**
 *  EXEMPLAR.
 *  <ul>
 *  <li>look for Things (using <code>self.bridge</code> data to initialize)
 *  <li>find / create a <code>native</code> that does the talking
 *  <li>create an WinkBridge(native)
 *  <li>call <code>self.discovered(bridge)</code> with it
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
    wink_api.login(cfgd.username, cfgd.password, function(error) {
        if (error) {
            logger.error({
                method: "discover/login",
                error: error,
            }, "WinkBridge could not login");
            return;
        }

        wink_api.getDevices(function(error, devices) {
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
 *  INSTANCE
 *  This is called when the Bridge is no longer needed. When
 */
WinkBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

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
 *  INSTANCE and EXEMPLAR (during shutdown).
 *  This is called when the Bridge is no longer needed.
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
 *  INSTANCE.
 *  Send data to whatever you're taking to.
 */
WinkBridge.prototype.push = function (pushd) {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "push",
        putd: putd
    }, "push");

    var qitem = {
        // if you set "id", new pushes will unqueue old pushes with the same id
        // id: self.number, 
        run: function () {
            self._pushd(pushd);
            self.queue.finished(qitem);
        }
    };
    self.queue.add(qitem);
};

/**
 *  Do the work of pushing. If you don't need queueing
 *  consider just moving this up into push
 */
WinkBridge.prototype._push = function (pushd) {
    if (pushd.on !== undefined) {
    }
};

/**
 *  INSTANCE.
 *  Pull data from whatever we're talking to. You don't
 *  have to implement this if it doesn't make sense
 */
WinkBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }
};

/* --- state --- */

/**
 *  INSTANCE.
 *  Return the metadata - compact form can be used.
 *  Does not have to work when not reachable
 *  <p>
 *  Really really useful things are:
 *  <ul>
 *  <li><code>iot:thing</code> required - a unique ID
 *  <li><code>iot:device</code> suggested if linking multiple things together
 *  <li><code>schema:name</code>
 *  <li><code>iot:number</code>
 *  <li><code>schema:manufacturer</code>
 *  <li><code>schema:model</code>
 */
WinkBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing": _.id.thing_urn.unique("Wink", "hub-" + self.native.props.hub_id, "id-" + self.native.id),
        "schema:name": self.native.name || "Wink",

        // other possibilites
        // "iot:thing": _.id.thing_urn.unique("Wink", self.native.uuid, self.initd.number),
        // "iot:number": self.initd.number,
        // "iot:device": _.id.thing_urn.unique("Wink", self.native.uuid),
        "schema:manufacturer": self.native.props.device_manufacturer,
        'iot:vendor/type': self.native.type,
        'iot:vendor/model': self.native.props.model_name,
    };

};

/**
 *  INSTANCE.
 *  Return True if this is reachable. You
 *  do not need to worry about connect / disconnect /
 *  shutdown states, they will be always checked first.
 */
WinkBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  INSTANCE.
 *  Configure an express web page to configure this Bridge.
 *  Return the name of the Bridge, which may be
 *  listed and displayed to the user.
 */
WinkBridge.prototype.configure = function (app) {};

/* --- injected: THIS CODE WILL BE REMOVED AT RUNTIME, DO NOT MODIFY  --- */
WinkBridge.prototype.discovered = function (bridge) {
    throw new Error("WinkBridge.discovered not implemented");
};

WinkBridge.prototype.pulled = function (pulld) {
    throw new Error("WinkBridge.pulled not implemented");
};

/* -- internals -- */

/*
 *  API
 */
exports.Bridge = WinkBridge;
