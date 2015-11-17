# node-contribute-i2c
This set of node-red nodes communicate with the Raspberry Pi I2C driver and uses the node-I2C package.
Run the following command in the root directory of your Node-RED install, usually
this is ~/.node-red .

    npm install node-red-contribute-i2c

Usage
-----

Provides three nodes - one to scan connected device, one to receive messages, and one to send.

#### Configuration
When you start using on of the below nodes you need first to configurate the I2C Device.
The Raspberry PI uses an special device name to connect to the I2C controller. Depending on the Raspberry PI version it can be one of the below values; for the RPi Rev 1 it <i>/dev/i2c-0</i> and all Others it will be <i>/dev/i2c-1</i> (=default).  In the config screen you can also set the default I2C-address to where the node sends the Messages and request's to.

### Scan I2C
This will scan the I2C bus for connected devices and has one in point to trigger the scan process and 2 out put points:
- The first output point give a list of all found decives in <b>msg.payload</b> and will be triggered once.
- The second output point will be triggered for every found device the address will be in <b>msg.payload</b>

### Input I2C 
this node will request data from a given node. The address can be set in the calling msg or set in the dialog screen. The command parameter can be put inside the <b>msg.command<b> or can also be set in dialog screen. this node outputs the result as a buffer in <b>msg.payload<b> together with the address (<b>msg.addrress</b>) and command (<b>msg.command</b>).

### Output I2C
This node will send a given String/array/buffer to a device connected to the address given in the calling msg or been set in the setup dialog. It is also possible to fill the payload by hand in the dialog.
