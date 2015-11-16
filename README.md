# node-contribute-i2c
This set of node-red nodes communicate with the Raspberry Pi I2C driver and uses the node-I2C package.

# Installation
[todo]

# Use it
After installation you have 3 new nodes.
1.) Scan I2C this will can the I2C bus for connected devices and has one in point to trigger the scan process and 2 out put points:
    - The first output point give a list of all found decives in msg.payload and will be triggered once.
    - The second output point will be triggered for every found device the address will be in msg.payload
2.) Input I2C node will request data from a given node. The address can be set in the calling msg or set in the dialog screen. The action parameter can be put inside the payload or can also be set in dialog screen. this node outputs the result as a buffer in msg.payload together with the address and action.
3.) Output I2C node will send a given String/array/buffer to a device connected to the address given in the calling msg or been set in the setup dialog. It is also possible to fill the payload by hand in the dialog.





