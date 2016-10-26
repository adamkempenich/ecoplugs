"use strict";

var dgram = require('dgram');

function EcoPlugGroup(config) {
    this.config = config;
    this.plugs = this.config.plugs || [];
}

EcoPlugGroup.prototype.setPowerState = function (thisPlug, powerState, callback) {

    var message = this.createMessage('set', thisPlug.id, powerState);
    var retry_count = 3;

    this.sendMessage(message, thisPlug, retry_count, function (err, message) {
        if (!err) {
            console.log("Setting %s switch with ID %s to: %s", thisPlug.name, thisPlug.id, (powerState ? "ON" : "OFF"));
        }
        if (callback) callback(err, null);
    }.bind(this));

}

EcoPlugGroup.prototype.getPowerState = function (thisPlug, callback) {

    var status = false;

    var message = this.createMessage('get', thisPlug.id);
    var retry_count = 3;

    this.sendMessage(message, thisPlug, retry_count, function (err, message) {
        if (!err) {
            status = this.readState(message);
            console.log("Status of %s switch with ID %s is: %s", thisPlug.name, thisPlug.id, (status ? "ON" : "OFF"));
        }
        if (callback) callback(err, status);
    }.bind(this));

}

EcoPlugGroup.prototype.identify = function (thisPlug, paired, callback) {
  console.log("Identify requested for " + thisPlug.name);
  callback();
}

EcoPlugGroup.prototype.createMessage = function (command, id, state) {

    var bufferLength;
    var command1;
    var command2;
    var new_state;

    if (command == 'set') {
        bufferLength = 130;
        command1 = 0x16000500;
        command2 = 0x0200;
        if (state) {
            new_state = 0x0101;
        } else {
            new_state = 0x0100;
        }
    }
    else if (command == 'get') {
        bufferLength = 128;
        command1 = 0x17000500;
        command2 = 0x0000;
    }
    else {
        throw err;
    }

    var buffer = new Buffer(bufferLength);

    buffer.fill(0);

    // Byte 0:3 - Command 0x16000500 = Write, 0x17000500 = Read
    buffer.writeUInt32BE(command1, 0);

    // Byte 4:7 - Command sequence num - looks random
    buffer.writeUInt32BE(Math.floor(Math.random() * 0xFFFF), 4);

    // Byte 8:9 - Not sure what this field is - 0x0200 = Write, 0x0000 = Read
    buffer.writeUInt16BE(command2, 8);

    // Byte 10:14 - ASCII encoded FW Version - Set in readback only?

    // Byte 15 - Always 0x0

    // Byte 16:31 - ECO Plugs ID ASCII Encoded - <ECO-xxxxxxxx>
    buffer.write(id, 16, 16);

    // Byte 32:47 - 0's - Possibly extension of Plug ID

    // Byte 48:79 - ECO Plugs name as set in app

    // Byte 80:95 - ECO Plugs ID without the 'ECO-' prefix - ASCII Encoded

    // Byte 96:111 - 0's

    // Byte 112:115 - Something gets returned here during readback - not sure

    // Byte 116:119 - The current epoch time in Little Endian
    buffer.writeUInt32LE((Math.floor(new Date() / 1000)), 116);

    // Byte 120:123 - 0's

    // Byte 124:127 - Not sure what this field is - this value works, but i've seen others 0xCDB8422A
    buffer.writeUInt32BE(0xCDB8422A, 124);

    // Byte 128:129 - Power state (only for writes)
    if (buffer.length == 130) {
        buffer.writeUInt16BE(new_state, 128);
    }

    return buffer;
}

EcoPlugGroup.prototype.sendMessage = function (message, thisPlug, retry_count, callback) {

    var socket = dgram.createSocket('udp4');
    var timeout;

    socket.on('message', function (message) {
        clearTimeout(timeout);
        socket.close();
        callback(null, message);
    }.bind(this));

    socket.send(message, 0, message.length, thisPlug.port || 80, thisPlug.host, function (err, bytes) {
        if (err) {
            callback(err);
        } else {
            timeout = setTimeout(function () {
                socket.close();
                if (retry_count > 0) {
                    console.log("Warning: Timeout connecting to %s - Retrying....", thisPlug.host);
                    var cnt = retry_count - 1;
                    this.sendMessage(message, thisPlug, cnt, callback);
                } else {
                    console.log("ERROR: Timeout connecting to %s - Failing", thisPlug.host);
                    callback(true);
                }
            }.bind(this), 500);
        }
    }.bind(this));

}

EcoPlugGroup.prototype.readState = function (message) {
    return (message.readUInt8(129)) ? true : false;
}

EcoPlugGroup.prototype.readName = function (message) {
    return (message.toString('ascii', 48, 79));
}

module.exports = EcoPlugGroup;
