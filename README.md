# node-red-contrib-i2c

This set of node-red nodes communicate with the Raspberry Pi I2C driver and uses the node-I2C package.
Run the following command in the root directory of your Node-RED install, usually
this is ~/.node-red.

This node now allows you configure the bus number of the i2c driver.
For most Pi this is 1 for /dev/i2c-1, or 0 for /dev/i2c-0 for a older rev 1 Pi.

## Install

Either use the Manage Palette option in the Node-RED Editor menu, or run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install --unsafe-perm node-red-contrib-i2c

## Usage

Provides three nodes - one to scan connected device, one to receive messages, and one to send.

### Scan I2C

This will scan the I2C bus for connected devices.
It has one input to trigger the scan process and 2 outputs:
- The first output gives a list of all found devices in <b>msg.payload</b> and will be triggered once.
- The second output will be triggered for every found device. The address will be in <b>msg.payload</b>

### Input I2C

This node will request data from a given device.
The address and command can both be set in the dialog screen or dynamically with <b>msg.address</b> and <b>msg.command</b>.
This node outputs the result as a buffer in <b>msg.payload</b> and places the address in <b>msg.address</b> and command in <b>msg.command</b>.

### Output I2C

This node will send a given String/array/buffer to a given device.
The address and command can both be set in the dialog screen or dynamically with <b>msg.address</b> and <b>msg.command</b>.
The payload can be set statically or dynamically (using msg.payload).

This payload can be a Buffer, Array, String or Integer.
When you use integers the number of bytes to send is important and can be set between 0 and 31 bytes.

Since v0.5.0 - you can daisychain this node, the input msg is sent unchanged to the next node.

### Important Note

This node is now using the I2C-bus package from @fivdi. It looks more robust and better for asyncrone processes like node-red. I would like to thank the maker for his work. You can vind his work on github: https://github.com/fivdi/i2c-bus

The pld set of nodes did use the work of Kelly's I2C package to work.
And I would like to thank him for the work he did on that package.
For more info check out his github account at: https://github.com/kelly/node-i2c
