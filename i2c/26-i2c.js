module.exports = function(RED) {
    "use strict";
    try {
        var I2C = require("i2c-bus");   
    } catch (error) {
        var I2C_ERROR = error;
        I2C = null;
    }

    function validateI2C(node) {
        if (!I2C) {
            node.log("Couldn't load i2c-bus, is your platform supported ?");
            node.status({fill:"gray",shape:"dot",text:"unsupported"});
            if (I2C_ERROR) console.error(I2C_ERROR);
            return false;
        }
        return true;
    }

    // The Scan Node
    function I2CScanNode(n) {
        RED.nodes.createNode(this, n);
        this.busno = isNaN(parseInt(n.busno)) ? 1 : parseInt(n.busno);
        var node = this;
        
        if (!validateI2C(node)) return;
            
        node.port = I2C.openSync(node.busno);
        node.on("input", function(msg) {
            node.port.scan(function(err, res) {
                // result contains a buffer of bytes
                if (err) {
                    node.error(err, msg);
                } else {
                    node.send([{ payload: res }, null]);
                    res.forEach(function(entry) {
                        node.send([null, { payload: entry, address: entry }]);
                    });
                }
            });
        });

        node.on("close", function() {
            node.port.closeSync();
        });
    }
    RED.nodes.registerType("i2c scan", I2CScanNode);


    // The Input Node
    function I2CInNode(n) {
        RED.nodes.createNode(this, n);
        this.busno = isNaN(parseInt(n.busno)) ? 1 : parseInt(n.busno);
        this.address = n.address;
        this.command = n.command;
        this.count = n.count;
        var node = this;
        
        if (!validateI2C(node)) return;

        node.port = I2C.openSync(node.busno);
        node.on("input", function(msg) {
            var address = node.address || msg.address;
            var command = node.command || msg.command;
            var buffcount = node.count || msg.bytes;
            address = parseInt(address);
            command = parseInt(command);
            buffcount = parseInt(buffcount);
            if (isNaN(address)) {
                this.status({ fill: "red", shape: "ring", text: "Address (" + address + ") value is missing or incorrect" });
                return;
            } else if ((!buffcount) || isNaN(buffcount)) {
                this.status({ fill: "red", shape: "ring", text: "Read bytes (" + buffcount + ") value is missing or incorrect" });
                return;
            } else {
                this.status({});
            }
            var buffer = new Buffer(buffcount);
            if (isNaN(command)) {
                node.port.i2cRead(address, buffcount, buffer, function(err, size, res) {
                    /* Block for read without command like pcf8574A and pcf8574 */
                    if (err) {
                        node.error(err, msg);
                    } else {
                        var payload;
                        if (buffcount == 1) {
                            payload = res[0];
                        } else {
                            payload = res;
                        }
                        msg = Object.assign({}, msg);
                        // node.log('log returned data'+JSON.stringify([size, res.length, res, res.toString("utf-8")]));
                        msg.address = address;
                        msg.command = command;
                        msg.payload = payload;
                        msg.size = size;
                        node.send(msg);
                    }
                });
            } else {
                node.port.readI2cBlock(address, command, buffcount, buffer, function(err, size, res) {
                    /* Block for read with command */
                    if (err) {
                        node.error(err, msg);
                    } else {
                        var payload;
                        if (buffcount == 1) {
                            payload = res[0];
                        } else {
                            payload = res;
                        }
                        msg = Object.assign({}, msg);
                        //  node.log('log returned data'+  JSON.stringify([size, res.length, res, res.toString("utf-8")]));
                        msg.address = address;
                        msg.command = command;
                        msg.payload = payload;
                        msg.size = size;
                        node.send(msg);
                    }
                });
            }
        });

        node.on("close", function() {
            node.port.closeSync();
        });
    }
    RED.nodes.registerType("i2c in", I2CInNode);


    // The Output Node
    function I2COutNode(n) {
        RED.nodes.createNode(this, n);
        this.busno = isNaN(parseInt(n.busno)) ? 1 : parseInt(n.busno);
        this.address = parseInt(n.address);
        this.command = parseInt(n.command);
        this.count = parseInt(n.count);
        this.payload = n.payload;
        this.payloadType = n.payloadType;
        var node = this;
        
        if (!validateI2C(node)) return;

        node.port = I2C.openSync(node.busno);
        node.on("input", function(msg) {
            var myPayload;
            var address = node.address;
            if (isNaN(address)) address = msg.address;
            var command = node.command;
            if (isNaN(command)) command = msg.command;
            var buffcount = node.count;
            if (isNaN(buffcount)) buffcount = msg.bytes;
            address = parseInt(address);
            command = parseInt(command);
            buffcount = parseInt(buffcount);
            if (isNaN(address)) {
                this.status({ fill: "red", shape: "ring", text: "Address (" + address + ") value is missing or incorrect" });
                return;
            } else if (isNaN(buffcount)) {
                this.status({ fill: "red", shape: "ring", text: "Send bytes (" + buffcount + ") value is missing or incorrect" });
                return;
            } else {
                this.status({});
            }
            try {
                if (this.payloadType == null) {
                    myPayload = this.payload;
                } else if (this.payloadType == 'none') {
                    myPayload = null;
                } else {
                    myPayload = RED.util.evaluateNodeProperty(this.payload, this.payloadType, this, msg);
                }
                if (myPayload == null || buffcount == 0) {
                    node.port.sendByte(address, command, function(err) {
                        if (err) {
                            node.error(err, msg);
                        } else {
                            node.send(msg);
                        }
                    });
                } else if (Number.isFinite(myPayload)) {
                    var data = myPayload;
                    myPayload = Buffer.allocUnsafe(buffcount);
                    myPayload.writeIntLE(data, 0, buffcount, true);
                } else if (typeof myPayload === "string" || Array.isArray(myPayload)) {
                    myPayload = Buffer.from(myPayload);
                }
                if (myPayload.length > 32) {
                    node.error("Too many bytes to write to I2C", msg);
                } else {
                    if (isNaN(command)) {
                        node.port.i2cWrite(address, myPayload.length, myPayload, function(err) {
                            if (err) { node.error(err, msg); } else { node.send(msg); }
                        });
                    } else {
                        node.port.writeI2cBlock(address, command, myPayload.length, myPayload, function(err) {
                            if (err) { node.error(err, msg); } else { node.send(msg); }
                        });
                    }
                }
            } catch (err) {
                this.error(err, msg);
            }
        });

        node.on("close", function() {
            node.port.closeSync();
        });
    }
    RED.nodes.registerType("i2c out", I2COutNode);
}
