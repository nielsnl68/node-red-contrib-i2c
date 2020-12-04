module.exports = function(RED) {
    "use strict";
    var I2C = require("i2c-bus");

    // The Scan Node
    function I2CScanNode(n) {
        RED.nodes.createNode(this, n);
        this.busno = isNaN(parseInt(n.busno) ? 1 : parseInt(n.busno));
        var node = this;

        node.port  = I2C.openSync( node.busno );
        node.on("input", function(msg) {
            node.port.scan(function(err, res) {
                // result contains a buffer of bytes
                if (err) {
                    node.error(err);
                } else {
                    node.send([{ payload:res }, null]);
                    res.forEach(function(entry) {
                        node.send([null, { payload:entry, address:entry }]);
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
        this.busno = isNaN(parseInt(n.busno) ? 1 : parseInt(n.busno));
        this.address = n.address;
        this.command = n.command;
        this.count = n.count;
        var node = this;

        node.port = I2C.openSync( node.busno );
        node.on("input", function(msg) {
            var address = node.address || msg.address ;
            var command = node.command || msg.command ;
            address = parseInt(address);
            command = parseInt(command);
            var buffcount = parseInt(node.count);
            if (isNaN(address)) {
                this.status({fill:"red",shape:"ring",text:"Address ("+address+") value is missing or incorrect"});
                return;
            } else if ((!buffcount) || isNaN(buffcount) ) {
                this.status({fill:"red",shape:"ring",text:"Read bytes value is missing or incorrect"});
                return;
            } else {
                this.status({});
            }
            var buffer = new Buffer(buffcount);
            if(isNaN(command)) {
                node.port.i2cRead(address, buffcount, buffer, function(err, size, res) {
                    /* Block for read without command like pcf8574A and pcf8574 */
                    if (err) {
                        node.error(err, msg);
                    } else {
                        var payload;
                        if (node.count == 1) {
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
                        node.error(err);
                    } else {
                        var payload;
                        if (node.count == 1) {
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
        this.busno = isNaN(parseInt(n.busno) ? 1 : parseInt(n.busno));
        this.address = parseInt(n.address);
        this.command = parseInt(n.command);
        this.count = parseInt(n.count);
        this.payload = n.payload;
        this.payloadType = n.payloadType;
        var node = this;

        node.port = I2C.openSync( node.busno );
        node.on("input", function(msg) {
            var myPayload;
            var address = node.address;
            if (isNaN(address)) address = msg.address;
            var command = node.command;
            if (isNaN(command)) command = msg.command;
            address = parseInt(address);
            command = parseInt(command);
            var buffcount = parseInt(node.count);
            if (isNaN(address)) {
                this.status({fill:"red",shape:"ring",text:"Address ("+address+") value is missing or incorrect"});
                return;
            } else if (isNaN(command) ) {
                this.status({fill:"red",shape:"ring",text:"Command  ("+command+") value is missing or incorrect"});
                return;
            } else if (isNaN(buffcount) ) {
                this.status({fill:"red",shape:"ring",text:"Send bytes value is missing or incorrect"});
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
                    myPayload = RED.util.evaluateNodeProperty(this.payload, this.payloadType, this,msg);
                }
                if (myPayload == null || node.count == 0) {
                    node.port.sendByte(address, command,  function(err) {
                        if (err) { node.error(err, msg);
                        } else {
                            node.send(msg);
                        }
                    });
                } else if (!isNaN(myPayload)) {
                    var data = myPayload;
                    myPayload = Buffer.allocUnsafe(node.count);
                    myPayload.writeIntLE(data, 0, node.count, true);
                } else if (typeof myPayload === "string" || Array.isArray(myPayload)) {
                    myPayload = Buffer.from(myPayload);
                }
                if (myPayload.length > 32) {
                    node.error("Too many bytes to write to I2C");
                } else {
                    // node.log('log write data'+  JSON.stringify([address, command, myPayload.length, myPayload, myPayload.toString("utf-8")]));
                    node.port.writeI2cBlock(address, command, myPayload.length, myPayload, function(err) {
                        if (err) {
                            node.error(err, msg);
                        } else {
                            node.send(msg);
                        }
                    });
                }
            } catch(err) {
                this.error(err,msg);
            }
        });

        node.on("close", function() {
            node.port.closeSync();
        });
    }
    RED.nodes.registerType("i2c out", I2COutNode);
}
