# node-red-contrib-i2c

This set of node-red nodes communicate with the Raspberry Pi I2C driver and uses the node-I2C package.
Run the following command in the root directory of your Node-RED install, usually
this is ~/.node-red.

As of version 0.5.0 the nodes are using the i2c-bus library to communicate with your devices. It looks more stable and up-to-date. Also the need to use a config-node is removed. The config node was needed to store the common i2c object. With the new i2c-bus library is that not needed anymore.

**Warning**: After upgrading to this version you will get an error of an unknown node in the config side-bar, you can safely remove this one.

Downside my nodes work only for newer version where the i2c driver is on /dev/i2c-1

## Install

Either use the Manage Palette option in the Node-RED Editor menu, or run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install --unsafe-perm node-red-contrib-i2c

## Usage

Provides three nodes - one to scan connected device, one to receive messages, and one to send.

### Configuration

When you start using one of the below nodes you need first to configure the I2C Device.
The Raspberry PI uses an special device name to connect to the I2C controller.
Depending on the Raspberry PI version it can be one of the below values; for the RPi Rev 1 it <i>/dev/i2c-0</i> and all Others it will be <i>/dev/i2c-1</i> (=default).  
In the config screen you can also set the default I2C-address to where the node sends the Messages and requests.

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

NEW(0.5.0): you can daisychain this node, the input msg is send unchanged to the next node.

### Important Note

Versions v0.5.0 onward are now using the I2C-bus package from @fivdi. It looks more robust and better for asyncrone processes like node-red. I would like the maker as much thanks for his work as Kelly in the past version. You can vind his work on github: https://github.com/fivdi/i2c-bus

The Old set of nodes did use the work of kelly's I2C package to work.
And I would like to thank him for the work he did on that package.
For more info check out his github account at: https://github.com/kelly/node-i2c
