module.exports = function(RED) {
    "use strict";
    var I2C = require("i2c");

    // The Server Definition - this opens (and closes) the connection
    function I2CServerNode(n) {
        RED.nodes.createNode(this,n);
        this.device = n.device ||"/dev/I2C-1";
        this.address = n.address || 0x18;
        this.port = null;
        this.on("close", function() {
            if (this.port != null) {
           //     this.port.disconnect();
            }
        });
    }
    RED.nodes.registerType("i2c-device",I2CServerNode);


    // The Input Node
    function I2CInNode(n) {
        RED.nodes.createNode(this,n);
        this.i2cdevice = n.i2cdevice;
        this.serverConfig = RED.nodes.getNode(this.i2cdevice);
        this.address =  n.address ;
        this.command =  n.command;
        this.count   =  n.count;
        var node = this;
        node.status({text:""});
        if (node.serverConfig.port === null) {
            node.log("CONNECT: "+node.serverConfig.device);
			      node.serverConfig.port = new node.I2C(parseInt(this.address), {	device : node.serverConfig.device	});
        }
        else { node.status({text:""}); }
        node.port = node.serverConfig.port;
		    node.on("input", function(msg) {
		      var address =  node.address || msg.address || this.serverConfig.address;
		      var command =  node.command || msg.command ;
			    node.port.setAddress(parseInt(address));
			    node.port.readBytes(parseInt(command), node.count, function(	err, res) {
			    if (err) {
					  node.error(err);
				  } else {
					  var payload;
					  if (Array.isArray(msg) && node.count == 1) {
						  payload = res[0];
					  } else {
						  payload = res;
					  }
           // msg.address = address;
           // msg.command = command;
           // msg.payload = payload;
            
					  node.send({address : address, command: command, payload : payload});
				}
			});
		});

        node.on("close", function() {
         //   node.port.free();
        });
    }
    RED.nodes.registerType("i2c in",I2CInNode);


    // The Output Node
    function I2COutNode(n) {
        RED.nodes.createNode(this,n);
        this.i2cdevice = n.i2cdevice;
        this.serverConfig = RED.nodes.getNode(this.i2cdevice);
        this.address = parseInt(n.address);
        this.command = parseInt(n.command);
		this.payload = n.payload;
        var node = this;
        node.status({text:""});
        if (node.serverConfig.port === null) {
            node.log("CONNECT: "+node.serverConfig.device);
 			      node.serverConfig.port = new node.I2C(this.address, {	device : node.serverConfig.device	});
        }
        else { node.status({text:""}); }
        
		node.port = node.serverConfig.port;

		node.on("input", function(msg) {
		    msg.address =  node.address || msg.address || this.serverConfig.address;
		    msg.command =  node.command || msg.command  ;
			
			node.port.setAddress(msg.address);
			var payload = node.payload || msg.payload;
            
			if (!isNaN(payload) ) {
				node.port.writeByte(parseInt(msg.command), parseint(payload),
						function(err) {
							if (err) node.error(err);
						});
			} else if (!Array.isArray(payload)) {
				payload = payload.toString();
				var bytes = [];

				for (var i = 0; i < payload.length; ++i) {
					bytes.push(payload.charCodeAt(i));
				}
				payload = bytes;
			} else if (Buffer.isbuffer(payload)) {
				var bytes = [];
				for (var i = 0; i < payload.length; ++i) {
					bytes.push(payload[i]);
				}
				payload = bytes;
			}
			if (payload.count > 32) {
				node.error("To many elements in array to write to I2C");
			} else {
				node.port.writeBytes(parseInt(node.command), payload, function(err) {
					if (err) node.error(err);
				});
			}
		});

        node.on("close", function() {
       //     node.port.free();
        });
    }
    RED.nodes.registerType("i2c out",I2COutNode);

	    // The Output Node
    function I2CScanNode(n) {
        RED.nodes.createNode(this,n);
        this.i2cdevice = n.i2cdevice;
        this.serverConfig = RED.nodes.getNode(this.i2cdevice);
        var node = this;
        if (node.serverConfig.port === null) {
            node.log("CONNECT: "+node.serverConfig.device);
//            node.status({fill:"grey",shape:"dot",text:"connecting"});
            //console.log(node);
			      node.serverConfig.port = new I2C(parseInt(this.serverConfig.address), {device : node.serverConfig.device});
		    //	console.log(node.serverConfig.port);
        }
        else { node.status({text:""}); }
        node.port = node.serverConfig.port;
        node.on("input", function(msg) {
			    node.port.scan(function(err, res) {
				    // result contains a buffer of bytes
				    if (err) {
					    node.error(errI);
				    } else {
					    node.send([{payload: res}, null]);
              res.forEach(function(entry) {  
						    node.send([null, {payload: entry, address: entry}]);
					    });
    					
    				}
    			});
    		});

        node.on("close", function() {
         //   node.port.free();
        });
    }
    RED.nodes.registerType("i2c scan",I2CScanNode);
	}
