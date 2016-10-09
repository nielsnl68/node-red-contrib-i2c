# node-red-contrib-i2c
This set of node-red nodes communicate with the Raspberry Pi I2C driver and uses the node-I2C package.
Run the following command in the root directory of your Node-RED install, usually
this is ~/.node-red .

    npm install —unsafe-perm node-red-contrib-i2c

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
This node will request data from a given device. The address and command can both be set in the dialog screen or dynamicly with <b>msg.address</b> and <b>msg.command</b>. This node outputs the result as a buffer in <b>msg.payload</b> and places the address in <b>msg.address</b> and command in <b>msg.command</b>.

### Output I2C
This node will send a given String/array/buffer to a given device. The address and command can both be set in the dialog screen or dynamicly with <b>msg.address</b> and <b>msg.command</b>. 
The payload can be staticly or dynamicly (using msg.payload) set. This payload can be a Buffer, Array, String or Integer. When you use integers then the number of bytes to send is importend and can be set between 0 and 6 bytes. 


#### Inportend Note
This set of nodes is using the work of kelly's I2C package to work. And i like to thank hem for the work he did on that package. 
For more info check out his github account at: https://github.com/kelly/node-i2c
